package com.ctms.util.converter;

import com.ctms.enums.TestResultStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for {@link TestResultStatus}.
 *
 * <p>Persists the enum as its database string value (Normal, Abnormal, Critical, Inconclusive),
 * matching the CHECK constraint defined in {@code sql/schema.sql}. Reuses the
 * original {@code dbValue()} / {@code fromDb()} contract from the JDBC project so
 * the on-disk representation is identical after the migration.
 *
 * <p>{@code autoApply = true} applies this converter to every {@code TestResultStatus}
 * field automatically, so entities need no per-field {@code @Convert} annotation.
 */
@Converter(autoApply = true)
public class TestResultStatusConverter implements AttributeConverter<TestResultStatus, String> {

    @Override
    public String convertToDatabaseColumn(TestResultStatus attribute) {
        return attribute == null ? null : attribute.dbValue();
    }

    @Override
    public TestResultStatus convertToEntityAttribute(String dbData) {
        return (dbData == null || dbData.isBlank()) ? null : TestResultStatus.fromDb(dbData);
    }
}
