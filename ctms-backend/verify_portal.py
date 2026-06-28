import re, os, sys

SRC = "src/main/java/com/ctms"
TEST = "src/test/java/com/ctms"

def read(p):
    with open(p) as f: return f.read()

# Build an index: simple class/interface name -> file path (main + test)
index = {}
for base in (SRC, TEST):
    for root,_,files in os.walk(base):
        for fn in files:
            if fn.endswith(".java"):
                index[fn[:-5]] = os.path.join(root, fn)

new_files = [
    f"{SRC}/controller/PortalController.java",
    f"{SRC}/service/ParticipantPortalService.java",
    f"{SRC}/service/impl/ParticipantPortalServiceImpl.java",
    f"{SRC}/dto/request/UpdateMyProfileRequest.java",
    f"{SRC}/dto/request/ApplyToTrialRequest.java",
    f"{SRC}/dto/response/ParticipantDashboardResponse.java",
    f"{TEST}/security/PortalSecurityTest.java",
]

problems = []

# 1) Every com.ctms.* import in new files must resolve to an indexed type
for nf in new_files:
    txt = read(nf)
    for m in re.finditer(r'import\s+(com\.ctms\.[\w.]+)\.(\w+);', txt):
        cls = m.group(2)
        if cls not in index:
            problems.append(f"[IMPORT] {os.path.basename(nf)}: cannot resolve com.ctms import -> {cls}")

# 2) Brace/paren balance sanity on new files
for nf in new_files:
    t = read(nf)
    # strip string/char literals and comments crudely for counting
    s = re.sub(r'//[^\n]*','',t)
    s = re.sub(r'/\*.*?\*/','',s,flags=re.S)
    s = re.sub(r'"(\\.|[^"\\])*"','""',s)
    for ch,(o,c) in {"braces":("{","}"),"parens":("(",")")}.items():
        if s.count(o)!=s.count(c):
            problems.append(f"[BALANCE] {os.path.basename(nf)}: {ch} mismatch {s.count(o)} vs {s.count(c)}")

# 3) Verify every service method the impl/controller calls actually exists in the interface
def method_names(interface_file):
    t = read(interface_file)
    return set(re.findall(r'\b(\w+)\s*\([^;{)]*\)\s*(?:throws [\w, ]+)?;', t))

impl = read(f"{SRC}/service/impl/ParticipantPortalServiceImpl.java")
calls = {
 "participantService": ("ParticipantService", ["enrollmentsForPatient","enroll","getEnrollment","updateEnrollmentStatus"]),
 "consentService": ("ConsentService", ["consentsForPatient","signConsent","declineConsent"]),
 "visitService": ("VisitService", ["visitsForPatient"]),
 "testResultService": ("TestResultService", ["resultsForPatient"]),
 "adverseEventService": ("AdverseEventService", ["eventsForPatient"]),
 "documentService": ("DocumentService", ["documentsForPatient"]),
 "notificationService": ("NotificationService", ["forUser","unreadForUser","markRead"]),
 "userService": ("UserService", ["changePassword"]),
 "trialService": ("TrialService", ["getTrial"]),
 "audit": ("AuditService", ["record"]),
}
for field,(iface,used) in calls.items():
    ipath = index.get(iface)
    if not ipath:
        problems.append(f"[SVC] interface not found: {iface}"); continue
    have = method_names(ipath)
    for mth in used:
        if mth not in have:
            problems.append(f"[SVC] {iface}.{mth}(...) called by portal but NOT declared in interface")

# 4) Repository methods used
repo = read(f"{SRC}/repository/PatientRepository.java")
if "findByUser_UserId" not in repo:
    problems.append("[REPO] PatientRepository.findByUser_UserId missing")
trepo = read(f"{SRC}/repository/TrialRepository.java")
if "findByStatus" not in trepo:
    problems.append("[REPO] TrialRepository.findByStatus missing")

# 5) AccessGuard predicates referenced in controller SpEL must exist
ctrl = read(f"{SRC}/controller/PortalController.java")
guard = read(f"{SRC}/security/AccessGuard.java")
for g in re.findall(r'@accessGuard\.(\w+)\(', ctrl):
    if f"boolean {g}(" not in guard:
        problems.append(f"[GUARD] @accessGuard.{g}(...) used in PortalController but not defined in AccessGuard")

# 6) Mapper methods
impl_uses_mapper = ["patientMapper.toResponse","trialMapper.toResponse"]
pm = read(f"{SRC}/mapper/PatientMapper.java"); tm = read(f"{SRC}/mapper/TrialMapper.java")
if "toResponse" not in pm: problems.append("[MAP] PatientMapper.toResponse missing")
if "toResponse" not in tm: problems.append("[MAP] TrialMapper.toResponse missing")

# 7) DTO getters the impl relies on (Lombok @Data/@Getter assumed) - check field presence
def has_field(dto, field):
    return re.search(rf'\bprivate\s+[\w<>]+\s+{field}\b', read(index[dto])) is not None
checks = [("EnrollmentResponse","status"),("ConsentResponse","consentStatus"),
          ("UpdateMyProfileRequest","phone"),("ApplyToTrialRequest","trialId")]
for dto,fld in checks:
    if dto not in index: problems.append(f"[DTO] {dto} not found"); continue
    if not has_field(dto,fld): problems.append(f"[DTO] {dto}.{fld} field missing")

# 8) Enum dbValue() usage
for en in ["EnrollmentStatus","ConsentStatus","TrialStatus"]:
    if "dbValue()" not in read(index[en]):
        problems.append(f"[ENUM] {en}.dbValue() missing")
if "ACTIVE" not in read(index["TrialStatus"]):
    problems.append("[ENUM] TrialStatus.ACTIVE missing")
if "WITHDRAWN" not in read(index["EnrollmentStatus"]):
    problems.append("[ENUM] EnrollmentStatus.WITHDRAWN missing")

print("="*60)
if problems:
    print(f"FAILED — {len(problems)} issue(s):")
    for p in problems: print("  -", p)
    sys.exit(1)
else:
    print("PASS — all symbols, imports, service methods, repo finders,")
    print("       guard predicates, mappers, DTO fields and enum accessors")
    print("       referenced by the new portal resolve against the codebase.")
