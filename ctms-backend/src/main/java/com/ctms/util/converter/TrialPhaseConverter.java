package com.ctms.util.converter;

import com.ctms.enums.TrialPhase;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for {@link TrialPhase}.
 *
 * <p>Persists the enum as its database string value (I, II, III, IV),
 * matching the CHECK constraint defined in {@code sql/schema.sql}. Reuses the
 * original {@code dbValue()} / {@code fromDb()} contract from the JDBC project so
 * the on-disk representation is identical after the migration.
 *
 * <p>{@code autoApply = true} applies this converter to every {@code TrialPhase}
 * field automatically, so entities need no per-field {@code @Convert} annotation.
 */
@Converter(autoApply = true)
public class TrialPhaseConverter implements AttributeConverter<TrialPhase, String> {

    @Override
    public String convertToDatabaseColumn(TrialPhase attribute) {
        return attribute == null ? null : attribute.dbValue();
    }

    @Override
    public TrialPhase convertToEntityAttribute(String dbData) {
        return (dbData == null || dbData.isBlank()) ? null : TrialPhase.fromDb(dbData);
    }
}
