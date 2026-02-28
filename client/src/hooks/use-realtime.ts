import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket, connectSocket, disconnectSocket } from "@/lib/socket";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";
import { Lead } from "@shared/schema";

export function useRealtime() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        if (!user) {
            disconnectSocket();
            return;
        }

        connectSocket(user.id);

        const onConnect = () => {
            setIsConnected(true);
            socket.emit("join:dashboard", user.id);
        };

        const onDisconnect = () => {
            setIsConnected(false);
        };

        const onNewLead = (lead: Lead) => {
            console.log(`[Client Socket] Received lead:new`, lead);
            // 1. Invalidate all leads lists (this covers any filters active on the Leads page)
            queryClient.invalidateQueries({ queryKey: [api.leads.list.path] });

            // 2. Invalidate dashboard stats (to refresh counters)
            queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });

            toast({
                title: "⚡ New Lead Captured!",
                description: `${lead.name || 'Anonymous'} just found you.`,
                className: "bg-[#0d1f2d] border-mongodb-green text-white font-bold",
            });
        };

        const onUpdateLead = (lead: Lead) => {
            console.log(`[Client Socket] Received lead:updated`, lead);
            // 1. Invalidate leads list
            queryClient.invalidateQueries({ queryKey: [api.leads.list.path] });

            // 2. Update Single Lead Cache
            queryClient.setQueryData([api.leads.get.path.replace(':id', lead.id.toString())], lead);

            // 3. Invalidate stats
            queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
        };

        const onStatsUpdate = (stats: any) => {
            console.log(`[Client Socket] Received stats:update`, stats);
            // Invalidate stats to ensure all components using different 'days' params refresh correctly
            queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("lead:new", onNewLead);
        socket.on("lead:updated", onUpdateLead);
        socket.on("stats:update", onStatsUpdate);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("lead:new", onNewLead);
            socket.off("lead:updated", onUpdateLead);
            socket.off("stats:update", onStatsUpdate);
        };
    }, [user, queryClient, toast]);

    return { isConnected };
}
