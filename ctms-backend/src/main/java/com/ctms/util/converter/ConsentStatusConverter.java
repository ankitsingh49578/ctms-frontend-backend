package com.ctms.util.converter;

import com.ctms.enums.ConsentStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for {@link ConsentStatus}.
 *
 * <p>Persists the enum as its database string value (Pending, Signed, Declined, Withdrawn),
 * matching the CHECK constraint defined in {@code sql/schema.sql}. Reuses the
 * original {@code dbValue()} / {@code fromDb()} contract from the JDBC project so
 * the on-disk representation is identical after the migration.
 *
 * <p>{@code autoApply = true} applies this converter to every {@code ConsentStatus}
 * field automatically, so entities need no per-field {@code @Convert} annotation.
 */
@Converter(autoApply = true)
public class ConsentStatusConverter implements AttributeConverter<ConsentStatus, String> {

    @Override
    public String convertToDatabaseColumn(ConsentStatus attribute) {
        return attribute == null ? null : attribute.dbValue();
    }

    @Override
    public ConsentStatus convertToEntityAttribute(String dbData) {
        return (dbData == null || dbData.isBlank()) ? null : ConsentStatus.fromDb(dbData);
    }
}
