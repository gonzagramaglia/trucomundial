import fs from 'fs';

const filePath = 'src/components/admin/AdminScreen.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Add imports for the new tabs
const imports = `import { PlayersTab } from "./tabs/PlayersTab";
import { MatchesTab } from "./tabs/MatchesTab";
import { TournamentsTab } from "./tabs/TournamentsTab";
import { ApplicationsTab } from "./tabs/ApplicationsTab";
import { TicketsTab } from "./tabs/TicketsTab";
`;

content = content.replace('import React, { useState, useEffect } from "react";', `import React, { useState, useEffect } from "react";\n${imports}`);

// Add missing handlers
const handlers = `  const handleApproveTournament = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tournaments")
        .update({ is_approved: true })
        .eq("id", id);
      if (error) throw error;
      setTournaments((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_approved: true } : t)),
      );
    } catch (err: any) {
      alert("Error al aprobar torneo: " + err.message);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("¿Estás seguro de eliminar este ticket permanentemente?")) return;
    try {
      const { error } = await supabase
        .from("tickets")
        .delete()
        .eq("id", ticketId);
      if (error) throw error;
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    } catch (err: any) {
      alert("Error al eliminar ticket: " + err.message);
    }
  };
`;

const handleTicketStatusRegex = /const handleTicketStatus = async[^}]+\n    \}\n  \};\n/;
const match = content.match(handleTicketStatusRegex);
if (match) {
  content = content.replace(match[0], match[0] + "\n" + handlers);
} else {
  console.log("Could not find handleTicketStatus to inject handlers.");
}

// Replace the giant JSX tabs
const startSearch = `        ) : activeTab === "players" ? (`;
const startIndex = content.indexOf(startSearch);
// Find the end by searching for the start of the detailed log modal
const endSearch = `        {/* DETAILED LOG MODAL */}`;
const endIndex = content.indexOf(endSearch);

if (startIndex !== -1 && endIndex !== -1) {
  const newJSX = `        ) : activeTab === "players" ? (
          <PlayersTab
            playerStats={playerStats}
            playerSearchTerm={playerSearchTerm}
            setPlayerSearchTerm={setPlayerSearchTerm}
            setSelectedUserStars={setSelectedUserStars}
            getPlayerRole={getPlayerRole}
            handleRoleChange={handleRoleChange}
            formatDate={formatDate}
          />
        ) : activeTab === "matches" ? (
          <MatchesTab
            history={history}
            formatDate={formatDate}
            setSelectedMatch={setSelectedMatch}
            isMobile={isMobile}
          />
        ) : activeTab === "tournaments" ? (
          <TournamentsTab
            tournaments={tournaments}
            usedCodes={usedCodes}
            formatDate={formatDate}
            setFormTournament={setFormTournament}
            setIsFormOpen={setIsFormOpen}
            setDeleteConfirmId={setDeleteConfirmId}
            handleApproveTournament={handleApproveTournament}
          />
        ) : activeTab === "applications" ? (
          <ApplicationsTab
            applications={applications}
            formatDate={formatDate}
            handleApplicationStatus={handleApplicationStatus}
            setEditingCreator={setEditingCreator}
            setIsCreatorProfileModalOpen={setIsCreatorProfileModalOpen}
          />
        ) : activeTab === "suggestions" || activeTab === "support" ? (
          <TicketsTab
            tickets={tickets}
            activeTab={activeTab}
            profiles={profiles}
            formatDate={formatDate}
            handleTicketStatus={handleTicketStatus}
            handleDeleteTicket={handleDeleteTicket}
          />
        ) : null}

`;

  content = content.substring(0, startIndex) + newJSX + content.substring(endIndex);
} else {
  console.log("Could not find JSX blocks to replace.", { startIndex, endIndex });
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log("AdminScreen.tsx refactored successfully.");
