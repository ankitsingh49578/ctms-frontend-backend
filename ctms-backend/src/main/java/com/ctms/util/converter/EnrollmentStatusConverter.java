package com.ctms.util.converter;

import com.ctms.enums.EnrollmentStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for {@link EnrollmentStatus}.
 *
 * <p>Persists the enum as its database string value (Screening, Enrolled, Completed, Withdrawn, Terminated),
 * matching the CHECK constraint defined in {@code sql/schema.sql}. Reuses the
 * original {@code dbValue()} / {@code fromDb()} contract from the JDBC project so
 * the on-disk representation is identical after the migration.
 *
 * <p>{@code autoApply = true} applies this converter to every {@code EnrollmentStatus}
 * field automatically, so entities need no per-field {@code @Convert} annotation.
 */
@Converter(autoApply = true)
public class EnrollmentStatusConverter implements AttributeConverter<EnrollmentStatus, String> {

    @Override
    public String convertToDatabaseColumn(EnrollmentStatus attribute) {
        return attribute == null ? null : attribute.dbValue();
    }

    @Override
    public EnrollmentStatus convertToEntityAttribute(String dbData) {
        return (dbData == null || dbData.isBlank()) ? null : EnrollmentStatus.fromDb(dbData);
    }
}
