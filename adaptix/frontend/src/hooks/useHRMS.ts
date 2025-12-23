import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Employee,
  Department,
  Designation,
  LeaveApplication,
  LeaveType,
  LeavePolicy,
  LeaveAllocation,
} from "@/lib/types";

export const useEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await api.get("/hrms/employees/list/");
      return response.data.results as Employee[];
    },
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await api.get("/hrms/employees/departments/");
      return response.data.results as Department[];
    },
  });
};

export const useLeaves = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["leaves"],
    queryFn: async () => {
      const response = await api.get("/hrms/leaves/applications/");
      return response.data.results as LeaveApplication[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<LeaveApplication>) => {
      const response = await api.post("/hrms/leaves/applications/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });

  return { ...query, createLeave: createMutation.mutateAsync };
};

export const useLeavePolicies = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["leave-policies"],
    queryFn: async () => {
      const response = await api.get("/hrms/leaves/policies/");
      return response.data.results as LeavePolicy[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<LeavePolicy>) => {
      const response = await api.post("/hrms/leaves/policies/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-policies"] });
    },
  });

  return { ...query, createPolicy: createMutation.mutateAsync };
};

export const useLeaveAllocations = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["leave-allocations"],
    queryFn: async () => {
      const response = await api.get("/hrms/leaves/allocations/");
      return response.data.results as LeaveAllocation[];
    },
  });

  const runEntitlement = useMutation({
    mutationFn: async (company_uuid: string) => {
      const response = await api.post(
        "/hrms/leaves/allocations/run-entitlement/",
        { company_uuid }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-allocations"] });
    },
  });

  const bulkApprove = useMutation({
    mutationFn: async (allocation_ids: string[]) => {
      const response = await api.post(
        "/hrms/leaves/allocations/bulk-approve/",
        { allocation_ids }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-allocations"] });
    },
  });

  return {
    ...query,
    runEntitlement: runEntitlement.mutateAsync,
    bulkApprove: bulkApprove.mutateAsync,
  };
};

export const useLeaveTypes = () => {
  return useQuery({
    queryKey: ["leave-types"],
    queryFn: async () => {
      const response = await api.get("/hrms/leaves/types/");
      return response.data.results as LeaveType[];
    },
  });
};
