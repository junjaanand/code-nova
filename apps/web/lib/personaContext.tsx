"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type PersonaRole = "creator" | "manager" | "reviewer" | "admin" | "auditor";

export interface Persona {
  id: string;
  name: string;
  title: string;
  role: PersonaRole;
  avatar: string;
  description: string;
  permissions: {
    canEditDraft: boolean;
    canAcceptFix: boolean;
    canOverrideFinding: boolean;
    canApproveHighRisk: boolean;
    canApproveStandard: boolean;
    canManageBrandPack: boolean;
    canExportAudit: boolean;
    isReadOnly: boolean;
  };
}

export const PERSONAS: Record<PersonaRole, Persona> = {
  creator: {
    id: "usr_priya",
    name: "Priya Sharma",
    title: "Content Creator",
    role: "creator",
    avatar: "PS",
    description: "Drafts social & marketing posts. Can accept AI tracked changes and submit for human approval.",
    permissions: {
      canEditDraft: true,
      canAcceptFix: true,
      canOverrideFinding: false, // Cannot override without reviewer
      canApproveHighRisk: false,
      canApproveStandard: false,
      canManageBrandPack: false,
      canExportAudit: false,
      isReadOnly: false,
    },
  },
  manager: {
    id: "usr_rahul",
    name: "Rahul Mehta",
    title: "Content Manager",
    role: "manager",
    avatar: "RM",
    description: "Oversees content queue. Can approve Standard & Elevated risk content and request revisions.",
    permissions: {
      canEditDraft: true,
      canAcceptFix: true,
      canOverrideFinding: true,
      canApproveHighRisk: false, // Legal required for high risk
      canApproveStandard: true,
      canManageBrandPack: false,
      canExportAudit: true,
      isReadOnly: false,
    },
  },
  reviewer: {
    id: "usr_legal",
    name: "Kavita Iyer",
    title: "Legal & Compliance Reviewer",
    role: "reviewer",
    avatar: "KI",
    description: "Evaluates high-risk claims, pricing, and regulatory compliance. Has override authority with documented reason.",
    permissions: {
      canEditDraft: false,
      canAcceptFix: true,
      canOverrideFinding: true,
      canApproveHighRisk: true,
      canApproveStandard: true,
      canManageBrandPack: false,
      canExportAudit: true,
      isReadOnly: false,
    },
  },
  admin: {
    id: "usr_ananya",
    name: "Ananya Deshmukh",
    title: "Head of Brand (Admin)",
    role: "admin",
    avatar: "AD",
    description: "Manages the Brand Pack, approves compiled rules, clarifies ambiguous guidelines, and sets policies.",
    permissions: {
      canEditDraft: true,
      canAcceptFix: true,
      canOverrideFinding: true,
      canApproveHighRisk: true,
      canApproveStandard: true,
      canManageBrandPack: true,
      canExportAudit: true,
      isReadOnly: false,
    },
  },
  auditor: {
    id: "usr_auditor",
    name: "Vikram Singh",
    title: "External Auditor",
    role: "auditor",
    avatar: "VS",
    description: "Read-only compliance auditor. Inspects citation grounding, override logs, and exports audit records.",
    permissions: {
      canEditDraft: false,
      canAcceptFix: false,
      canOverrideFinding: false,
      canApproveHighRisk: false,
      canApproveStandard: false,
      canManageBrandPack: false,
      canExportAudit: true,
      isReadOnly: true,
    },
  },
};

interface PersonaContextType {
  currentPersona: Persona;
  setPersona: (role: PersonaRole) => void;
}

const PersonaContext = createContext<PersonaContextType>({
  currentPersona: PERSONAS.creator,
  setPersona: () => {},
});

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<PersonaRole>("creator");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("brandshield_persona_role") as PersonaRole;
      if (saved && PERSONAS[saved]) {
        setRole(saved);
      }
    }
  }, []);

  const currentPersona = PERSONAS[role] || PERSONAS.creator;

  const setPersona = (newRole: PersonaRole) => {
    setRole(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("brandshield_persona_role", newRole);
      const persona = PERSONAS[newRole];
      if (persona) {
        localStorage.setItem("brandshield_user_id", persona.id);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("brandshield_user_id", currentPersona.id);
    }
  }, [currentPersona]);

  return (
    <PersonaContext.Provider value={{ currentPersona, setPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  return useContext(PersonaContext);
}
