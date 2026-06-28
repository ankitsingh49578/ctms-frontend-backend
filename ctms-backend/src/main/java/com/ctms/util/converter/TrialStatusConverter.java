package com.ctms.util.converter;

import com.ctms.enums.TrialStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for {@link TrialStatus}.
 *
 * <p>Persists the enum as its database string value (Planned, Active, Completed, On Hold, Terminated),
 * matching the CHECK constraint defined in {@code sql/schema.sql}. Reuses the
 * original {@code dbValue()} / {@code fromDb()} contract from the JDBC project so
 * the on-disk representation is identical after the migration.
 *
 * <p>{@code autoApply = true} applies this converter to every {@code TrialStatus}
 * field automatically, so entities need no per-field {@code @Convert} annotation.
 */
@Converter(autoApply = true)
public class TrialStatusConverter implements AttributeConverter<TrialStatus, String> {

    @Override
    public String convertToDatabaseColumn(TrialStatus attribute) {
        return attribute == null ? null : attribute.dbValue();
    }

    @Override
    public TrialStatus convertToEntityAttribute(String dbData) {
        return (dbData == null || dbData.isBlank()) ? null : TrialStatus.fromDb(dbData);
    }
}
