package com.ctms.util.converter;

import com.ctms.enums.VisitStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for {@link VisitStatus}.
 *
 * <p>Persists the enum as its database string value (Scheduled, Completed, Missed, Cancelled, Rescheduled),
 * matching the CHECK constraint defined in {@code sql/schema.sql}. Reuses the
 * original {@code dbValue()} / {@code fromDb()} contract from the JDBC project so
 * the on-disk representation is identical after the migration.
 *
 * <p>{@code autoApply = true} applies this converter to every {@code VisitStatus}
 * field automatically, so entities need no per-field {@code @Convert} annotation.
 */
@Converter(autoApply = true)
public class VisitStatusConverter implements AttributeConverter<VisitStatus, String> {

    @Override
    public String convertToDatabaseColumn(VisitStatus attribute) {
        return attribute == null ? null : attribute.dbValue();
    }

    @Override
    public VisitStatus convertToEntityAttribute(String dbData) {
        return (dbData == null || dbData.isBlank()) ? null : VisitStatus.fromDb(dbData);
    }
}
