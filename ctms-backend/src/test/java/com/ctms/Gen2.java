package com.ctms;
import com.ctms.util.PasswordUtil;
public class Gen2 {
    public static void main(String[] args) {
        System.out.println("ADMIN:" + PasswordUtil.hash("Admin@123"));
        System.out.println("CLINICAL_MANAGER:" + PasswordUtil.hash("Cm@123"));
        System.out.println("DOCTOR:" + PasswordUtil.hash("Doctor@123"));
        System.out.println("TRIAL_MANAGER:" + PasswordUtil.hash("Tm@123"));
        System.out.println("STUDY_COORDINATOR:" + PasswordUtil.hash("Coord@123"));
        System.out.println("PARTICIPANT:" + PasswordUtil.hash("Patient@123"));
    }
}
