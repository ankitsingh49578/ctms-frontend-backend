package com.ctms.util.converter;

import com.ctms.enums.AdverseEventStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for {@link AdverseEventStatus}.
 *
 * <p>Persists the enum as its database string value (Reported, In Review, Resolved, Closed),
 * matching the CHECK constraint defined in {@code sql/schema.sql}. Reuses the
 * original {@code dbValue()} / {@code fromDb()} contract from the JDBC project so
 * the on-disk representation is identical after the migration.
 *
 * <p>{@code autoApply = true} applies this converter to every {@code AdverseEventStatus}
 * field automatically, so entities need no per-field {@code @Convert} annotation.
 */
@Converter(autoApply = true)
public class AdverseEventStatusConverter implements AttributeConverter<AdverseEventStatus, String> {

    @Override
    public String convertToDatabaseColumn(AdverseEventStatus attribute) {
        return attribute == null ? null : attribute.dbValue();
    }

    @Override
    public AdverseEventStatus convertToEntityAttribute(String dbData) {
        return (dbData == null || dbData.isBlank()) ? null : AdverseEventStatus.fromDb(dbData);
    }
}
