import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class ApplySqlPatch {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/ctms_db";
        String user = "postgres";
        String password = "password"; // wait, application.yml says pgankit
        
        try (Connection conn = DriverManager.getConnection(url, user, "pgankit");
             Statement stmt = conn.createStatement()) {
            
            stmt.execute("ALTER TABLE adverse_events DROP CONSTRAINT IF EXISTS chk_ae_severity;");
            stmt.execute("ALTER TABLE adverse_events ADD CONSTRAINT chk_ae_severity CHECK (severity IN ('Mild','Moderate','Severe','Life Threatening','Fatal'));");
            
            stmt.execute("ALTER TABLE adverse_events ADD COLUMN IF NOT EXISTS event_type VARCHAR(100);");
            stmt.execute("ALTER TABLE adverse_events ADD COLUMN IF NOT EXISTS serious_adverse_event BOOLEAN;");
            stmt.execute("ALTER TABLE adverse_events ADD COLUMN IF NOT EXISTS expected_event BOOLEAN;");
            stmt.execute("ALTER TABLE adverse_events ADD COLUMN IF NOT EXISTS related_to_trial_drug VARCHAR(50);");
            stmt.execute("ALTER TABLE adverse_events ADD COLUMN IF NOT EXISTS causality_assessment VARCHAR(50);");
            stmt.execute("ALTER TABLE adverse_events ADD COLUMN IF NOT EXISTS outcome VARCHAR(50);");
            stmt.execute("ALTER TABLE adverse_events ADD COLUMN IF NOT EXISTS medication_given TEXT;");
            stmt.execute("ALTER TABLE adverse_events ADD COLUMN IF NOT EXISTS hospitalized BOOLEAN;");
            stmt.execute("ALTER TABLE adverse_events ADD COLUMN IF NOT EXISTS hospital_name VARCHAR(255);");
            stmt.execute("ALTER TABLE adverse_events ADD COLUMN IF NOT EXISTS reported_to_sponsor BOOLEAN;");
            stmt.execute("ALTER TABLE adverse_events ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN;");
            stmt.execute("ALTER TABLE adverse_events ADD COLUMN IF NOT EXISTS follow_up_date DATE;");
            
            System.out.println("SQL patch applied successfully.");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
