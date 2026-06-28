import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class RollbackSqlPatch {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/ctms_db";
        String user = "postgres";
        String password = "pgankit";
        
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Executing rollback...");
            
            stmt.execute("ALTER TABLE adverse_events DROP COLUMN IF EXISTS event_type;");
            stmt.execute("ALTER TABLE adverse_events DROP COLUMN IF EXISTS serious_adverse_event;");
            stmt.execute("ALTER TABLE adverse_events DROP COLUMN IF EXISTS expected_event;");
            stmt.execute("ALTER TABLE adverse_events DROP COLUMN IF EXISTS related_to_trial_drug;");
            stmt.execute("ALTER TABLE adverse_events DROP COLUMN IF EXISTS causality_assessment;");
            stmt.execute("ALTER TABLE adverse_events DROP COLUMN IF EXISTS outcome;");
            stmt.execute("ALTER TABLE adverse_events DROP COLUMN IF EXISTS medication_given;");
            stmt.execute("ALTER TABLE adverse_events DROP COLUMN IF EXISTS hospitalized;");
            stmt.execute("ALTER TABLE adverse_events DROP COLUMN IF EXISTS hospital_name;");
            stmt.execute("ALTER TABLE adverse_events DROP COLUMN IF EXISTS reported_to_sponsor;");
            stmt.execute("ALTER TABLE adverse_events DROP COLUMN IF EXISTS follow_up_required;");
            stmt.execute("ALTER TABLE adverse_events DROP COLUMN IF EXISTS follow_up_date;");

            // Revert status constraint
            stmt.execute("ALTER TABLE adverse_events DROP CONSTRAINT IF EXISTS chk_ae_status;");
            stmt.execute("ALTER TABLE adverse_events ADD CONSTRAINT chk_ae_status CHECK (status IN ('Reported','In Review','Resolved','Closed'));");

            // Delete any rows that use FATAL because we are removing it, or change them to Severe
            stmt.execute("UPDATE adverse_events SET severity = 'Severe' WHERE severity = 'Fatal';");
            stmt.execute("ALTER TABLE adverse_events DROP CONSTRAINT IF EXISTS chk_ae_severity;");
            stmt.execute("ALTER TABLE adverse_events ADD CONSTRAINT chk_ae_severity CHECK (severity IN ('Mild','Moderate','Severe','Life Threatening'));");

            System.out.println("Rollback applied successfully.");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
