package com.ctms.util.converter;

import com.ctms.enums.Severity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for {@link Severity}.
 *
 * <p>Persists the enum as its database string value (Mild, Moderate, Severe, Life Threatening),
 * matching the CHECK constraint defined in {@code sql/schema.sql}. Reuses the
 * original {@code dbValue()} / {@code fromDb()} contract from the JDBC project so
 * the on-disk representation is identical after the migration.
 *
 * <p>{@code autoApply = true} applies this converter to every {@code Severity}
 * field automatically, so entities need no per-field {@code @Convert} annotation.
 */
@Converter(autoApply = true)
public class SeverityConverter implements AttributeConverter<Severity, String> {

    @Override
    public String convertToDatabaseColumn(Severity attribute) {
        return attribute == null ? null : attribute.dbValue();
    }

    @Override
    public Severity convertToEntityAttribute(String dbData) {
        return (dbData == null || dbData.isBlank()) ? null : Severity.fromDb(dbData);
    }
}
