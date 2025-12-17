package com.example.Server.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
//
//    @ExceptionHandler(NotFoundException.class)
//    public ResponseEntity<?> handleNotFound(NotFoundException ex) {
//        Map<String, Object> res = new HashMap<>();
//        res.put("status", 404);
//        res.put("message", ex.getMessage());
//        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
//    }
//
//    @ExceptionHandler(Exception.class)
//    public ResponseEntity<?> handleGeneral(Exception ex) {
//        ex.printStackTrace();
//
//        Map<String, Object> res = new HashMap<>();
//        res.put("status", 500);
//        res.put("message", ex.getMessage());
//        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
//    }

}