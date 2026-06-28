package com.ctms.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;
import java.time.Period;

public class ValidAgeValidator implements ConstraintValidator<ValidAge, LocalDate> {

    private int min;
    private int max;

    @Override
    public void initialize(ValidAge constraintAnnotation) {
        this.min = constraintAnnotation.min();
        this.max = constraintAnnotation.max();
    }

    @Override
    public boolean isValid(LocalDate dob, ConstraintValidatorContext context) {
        if (dob == null) {
            return true; // Not null should be handled by @NotNull
        }

        int age = Period.between(dob, LocalDate.now()).getYears();
        
        if (age < min) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Participant must be at least " + min + " years old.")
                   .addConstraintViolation();
            return false;
        }
        
        if (age > max) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Participant age cannot exceed " + max + " years.")
                   .addConstraintViolation();
            return false;
        }

        return true;
    }
}
