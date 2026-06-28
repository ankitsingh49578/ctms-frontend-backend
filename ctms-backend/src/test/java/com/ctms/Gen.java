package com.ctms;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class Gen {
    public static void main(String[] args) {
        BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
        System.out.println("admin1:" + enc.encode("Admin@123"));
        System.out.println("cm1:" + enc.encode("Cm@123"));
        System.out.println("doctor1:" + enc.encode("Doctor@123"));
        System.out.println("tm1:" + enc.encode("Tm@123"));
        System.out.println("coord1:" + enc.encode("Coord@123"));
        System.out.println("patient1:" + enc.encode("Patient@123"));
    }
}
