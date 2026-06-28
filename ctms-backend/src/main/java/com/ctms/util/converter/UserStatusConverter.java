package com.ctms.util.converter;

import com.ctms.enums.UserStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for {@link UserStatus}.
 *
 * <p>Persists the enum as its database string value (Active, Inactive),
 * matching the CHECK constraint defined in {@code sql/schema.sql}. Reuses the
 * original {@code dbValue()} / {@code fromDb()} contract from the JDBC project so
 * the on-disk representation is identical after the migration.
 *
 * <p>{@code autoApply = true} applies this converter to every {@code UserStatus}
 * field automatically, so entities need no per-field {@code @Convert} annotation.
 */
@Converter(autoApply = true)
public class UserStatusConverter implements AttributeConverter<UserStatus, String> {

    @Override
    public String convertToDatabaseColumn(UserStatus attribute) {
        return attribute == null ? null : attribute.dbValue();
    }

    @Override
    public UserStatus convertToEntityAttribute(String dbData) {
        return (dbData == null || dbData.isBlank()) ? null : UserStatus.fromDb(dbData);
    }
}
