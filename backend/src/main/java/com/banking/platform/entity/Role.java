package com.banking.platform.entity;

/**
 * Role enumeration for role-based access control (RBAC).
 * <p>
 * USER  – standard platform user; can view balances, transfer funds.
 * ADMIN – elevated privileges; can view all users, flag fraud, manage literacy modules.
 */
public enum Role {
    USER,
    ADMIN
}
