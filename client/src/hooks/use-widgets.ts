import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateWidgetRequest, type UpdateWidgetRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useWidgets() {
  return useQuery({
    queryKey: [api.widgets.list.path],
    queryFn: async () => {
      const res = await fetch(api.widgets.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch widgets");
      return api.widgets.list.responses[200].parse(await res.json());
    },
  });
}

export function useWidget(id: number) {
  return useQuery({
    queryKey: [api.widgets.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.widgets.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch widget");
      return api.widgets.get.responses[200].parse(await res.json());
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateWidget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: CreateWidgetRequest) => {
      // Omit agencyId as it's handled by session on backend
      const { agencyId, ...rest } = data; 
      const res = await fetch(api.widgets.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create widget");
      return api.widgets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.widgets.list.path] });
      toast({ title: "Success", description: "Widget created successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to create widget", variant: "destructive" }),
  });
}

export function useUpdateWidget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateWidgetRequest }) => {
      const url = buildUrl(api.widgets.update.path, { id });
      const { agencyId, ...rest } = data;
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update widget");
      return api.widgets.update.responses[200].parse(await res.json());
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: [api.widgets.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.widgets.get.path, updated.id] });
      toast({ title: "Success", description: "Widget updated successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to update widget", variant: "destructive" }),
  });
}

export function useDeleteWidget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.widgets.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete widget");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.widgets.list.path] });
      toast({ title: "Deleted", description: "Widget removed successfully" });
    },
  });
}
