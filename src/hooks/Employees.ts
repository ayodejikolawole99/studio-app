// src/hooks/useEmployees.ts
import { useState, useEffect } from "react";
import type { Employee } from "@/types/employee";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      if (res.ok) {
        setEmployees(data.employees);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch employees");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  // Create a new employee
  const createEmployee = async (
    payload: Omit<Employee, "id" | "ticketBalance" | "createdAt">
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees((prev) => [...prev, data.employee]);
        setError(null);
      } else {
        setError(data.error || "Failed to create employee");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  // Update an employee
  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp))
        );
        setError(null);
      } else {
        setError(data.error || "Failed to update employee");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  // Delete an employee
  const deleteEmployee = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setEmployees((prev) => prev.filter((emp) => emp.id !== id));
        setError(null);
      } else {
        setError(data.error || "Failed to delete employee");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}