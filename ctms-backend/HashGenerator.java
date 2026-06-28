package com.ctms;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class HashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("admin1:" + encoder.encode("Admin@123"));
        System.out.println("cm1:" + encoder.encode("Cm@123"));
        System.out.println("doctor1:" + encoder.encode("Doctor@123"));
        System.out.println("tm1:" + encoder.encode("Tm@123"));
        System.out.println("coord1:" + encoder.encode("Coord@123"));
        System.out.println("patient1:" + encoder.encode("Patient@123"));
    }
}
