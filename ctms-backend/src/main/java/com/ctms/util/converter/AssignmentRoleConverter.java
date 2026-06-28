package com.ctms.util.converter;

import com.ctms.enums.AssignmentRole;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for {@link AssignmentRole}.
 *
 * <p>Persists the enum as its database string value (Manager, Coordinator, Monitor),
 * matching the CHECK constraint defined in {@code sql/schema.sql}. Reuses the
 * original {@code dbValue()} / {@code fromDb()} contract from the JDBC project so
 * the on-disk representation is identical after the migration.
 *
 * <p>{@code autoApply = true} applies this converter to every {@code AssignmentRole}
 * field automatically, so entities need no per-field {@code @Convert} annotation.
 */
@Converter(autoApply = true)
public class AssignmentRoleConverter implements AttributeConverter<AssignmentRole, String> {

    @Override
    public String convertToDatabaseColumn(AssignmentRole attribute) {
        return attribute == null ? null : attribute.dbValue();
    }

    @Override
    public AssignmentRole convertToEntityAttribute(String dbData) {
        return (dbData == null || dbData.isBlank()) ? null : AssignmentRole.fromDb(dbData);
    }
}
