package com.ctms.util.converter;

import com.ctms.enums.Gender;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for {@link Gender}.
 *
 * <p>Persists the enum as its database string value (Male, Female, Other),
 * matching the CHECK constraint defined in {@code sql/schema.sql}. Reuses the
 * original {@code dbValue()} / {@code fromDb()} contract from the JDBC project so
 * the on-disk representation is identical after the migration.
 *
 * <p>{@code autoApply = true} applies this converter to every {@code Gender}
 * field automatically, so entities need no per-field {@code @Convert} annotation.
 */
@Converter(autoApply = true)
public class GenderConverter implements AttributeConverter<Gender, String> {

    @Override
    public String convertToDatabaseColumn(Gender attribute) {
        return attribute == null ? null : attribute.dbValue();
    }

    @Override
    public Gender convertToEntityAttribute(String dbData) {
        return (dbData == null || dbData.isBlank()) ? null : Gender.fromDb(dbData);
    }
}
