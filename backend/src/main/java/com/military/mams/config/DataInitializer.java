package com.military.mams.config;

import com.military.mams.entity.*;
import com.military.mams.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final MilitaryBaseRepository baseRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           MilitaryBaseRepository baseRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.baseRepository = baseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        log.info("Checking and initializing user credentials...");
        String defaultEncodedPassword = passwordEncoder.encode("password123");

        List<User> users = userRepository.findAll();
        for (User u : users) {
            u.setPassword(defaultEncodedPassword);
            userRepository.save(u);
        }
        log.info("Initialized {} users with default password 'password123'.", users.size());
    }
}
