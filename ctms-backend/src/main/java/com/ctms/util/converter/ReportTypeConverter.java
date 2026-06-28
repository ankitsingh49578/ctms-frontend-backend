package com.ctms.util.converter;

import com.ctms.enums.ReportType;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for {@link ReportType}.
 *
 * <p>Persists the enum as its database string value (Recruitment, Safety, Performance, Compliance, Other),
 * matching the CHECK constraint defined in {@code sql/schema.sql}. Reuses the
 * original {@code dbValue()} / {@code fromDb()} contract from the JDBC project so
 * the on-disk representation is identical after the migration.
 *
 * <p>{@code autoApply = true} applies this converter to every {@code ReportType}
 * field automatically, so entities need no per-field {@code @Convert} annotation.
 */
@Converter(autoApply = true)
public class ReportTypeConverter implements AttributeConverter<ReportType, String> {

    @Override
    public String convertToDatabaseColumn(ReportType attribute) {
        return attribute == null ? null : attribute.dbValue();
    }

    @Override
    public ReportType convertToEntityAttribute(String dbData) {
        return (dbData == null || dbData.isBlank()) ? null : ReportType.fromDb(dbData);
    }
}
