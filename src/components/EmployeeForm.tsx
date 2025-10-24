"use client";

import { useState } from "react";
import { useEmployees } from "@/src/hooks/useEmployees";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { toast } from "sonner";

const EmployeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  department: z.string().min(1, "Department is required"),
  biometricTemplate: z.string().optional(),
});

type FormData = z.infer<typeof EmployeeSchema>;

type EmployeeFormProps = {
  initialData?: {
    id: string;
    name: string;
    employeeId: string;
    department: string;
    biometricTemplate?: string;
  };
  onSuccess?: () => void;
};

export default function EmployeeForm({ initialData, onSuccess }: EmployeeFormProps) {
  const isEdit = !!initialData;
  const { createEmployee, updateEmployee, loading } = useEmployees();

  const [form, setForm] = useState<FormData>({
    name: initialData?.name || "",
    employeeId: initialData?.employeeId || "",
    department: initialData?.department || "",
    biometricTemplate: initialData?.biometricTemplate || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = EmployeeSchema.safeParse(form);
    if (!result.success) {
      toast.error("Please fix the form errors");
      return;
    }

    if (isEdit && initialData?.id) {
      await updateEmployee(initialData.id, result.data);
      toast.success("Employee updated successfully");
    } else {
      await createEmployee(result.data);
      toast.success("Employee created successfully");
    }

    if (onSuccess) onSuccess();
    setForm({ name: "", employeeId: "", department: "", biometricTemplate: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={form.name} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="employeeId">Employee ID</Label>
        <Input id="employeeId" name="employeeId" value={form.employeeId} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="department">Department</Label>
        <Input id="department" name="department" value={form.department} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="biometricTemplate">Biometric Template</Label>
        <Input
          id="biometricTemplate"
          name="biometricTemplate"
          value={form.biometricTemplate}
          onChange={handleChange}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update" : "Create"}
      </Button>
    </form>
  );
}