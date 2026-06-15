import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tournamentSchema, type TournamentFormData } from "../../lib/schemas";
import { supabase } from "../../lib/supabase";
import { normalizeTournamentPrizes } from "../../lib/formatters";

interface TournamentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: any | null;
  creatorName: string;
  onSuccess: () => void;
  
}

export const TournamentFormModal: React.FC<TournamentFormModalProps> = ({
  isOpen,
  onClose,
  tournament,
  creatorName,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [formError, setFormError] = useState("");

  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
  });

  const formData = watch();
  const prizeFields = formData.prize || [];
  const maxPrizeSlots = formData.max_participants || 16;

  const updateFormData = (data: Partial<TournamentFormData>) => {
    Object.keys(data).forEach((key) => {
      setValue(
        key as keyof TournamentFormData,
        data[key as keyof TournamentFormData],
        {
          shouldValidate: true,
          shouldDirty: true,
        },
      );
    });
  };

  useEffect(() => {
    if (isOpen) {
      setFormError("");
      if (tournament) {
        reset({
          ...tournament,
          prize: normalizeTournamentPrizes(tournament.prize),
          allowed_teams: tournament.allowed_teams || ["Alemania","Argelia","Argentina","Austria","Bélgica","Bosnia y Herz","Brasil","Canadá","Colombia","Corea del Sur","Costa de Marfil","Croacia","Ecuador","Escocia","España","Francia","Inglaterra","Japón","Marruecos","México","Noruega","Nueva Zelanda","Países Bajos","Panamá","Paraguay","Portugal","Qatar","República Checa","Sudáfrica","Suecia","Suiza","Uruguay","USA"],
        });
      } else {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const defaultDate = now.toISOString().slice(0, 16);

        reset({
          name: "",
          status: "open",
          participants: 0,
          min_participants: 4,
          max_participants: 16,
          start_time: defaultDate,
          prize: [""],
          bg_gradient:
            "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(255, 0, 128, 0.04) 100%)",
          winner: "",
          organizer: creatorName,
          visibility: "public",
          code_type: "single",
          codes: [],
          allowed_teams: ["Alemania","Argelia","Argentina","Austria","Bélgica","Bosnia y Herz","Brasil","Canadá","Colombia","Corea del Sur","Croacia","Ecuador","Escocia","España","Francia","Inglaterra","Japón","Marruecos","México","Noruega","Nueva Zelanda","Países Bajos","Panamá","Paraguay","Portugal","Qatar","República Checa","Sudáfrica","Suecia","Suiza","Uruguay","USA"],
        });
      }
    }
  }, [isOpen, tournament, creatorName, reset]);

  const onSubmit = async (data: TournamentFormData) => {
    setFormError("");

    try {
      const targetCount =
        data.code_type === "single" ? 1 : data.max_participants || 16;
      const currentCodes = [...(data.codes || [])];

      while (currentCodes.length < targetCount) {
        currentCodes.push(
          Math.random().toString(36).substring(2, 6).toUpperCase(),
        );
      }

      const payload = {
        ...data,
        codes: currentCodes,
      };

      if (tournament) {
        // Update
        const { error } = await supabase
          .from("tournaments")
          .update(payload)
          .eq("id", tournament.id);

        if (error) throw error;
      } else {
        // Create
        const insertPayload = {
          ...payload,
          is_approved: false,
        };
        const { error } = await supabase.from("tournaments").insert([insertPayload]);

        if (error) throw error;
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setFormError("Error guardando torneo: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3000,
          padding: "1rem",
        }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          style={{
            background: "rgba(20, 15, 30, 0.95)",
            border: "1px solid rgba(255, 120, 0, 0.3)",
            borderRadius: "2rem",
            padding: "2rem",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <h3
              className="text-display"
              style={{ margin: 0, fontSize: "1.5rem", color: "#ff7800" }}
            >
              {tournament ? t("edit_tournament") : t("create_tournament")}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <X size={24} />
            </button>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                }}
              >
                {t("tournament_name")}
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => updateFormData({ name: e.target.value })}
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.3)",
                  border: errors.name
                    ? "1px solid rgba(239, 68, 68, 0.5)"
                    : "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                }}
              />
              {errors.name && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "0.8rem",
                    marginTop: "0.5rem",
                    display: "block",
                    fontWeight: 700,
                  }}
                >
                  {errors.name.message}
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                  }}
                >
                  {t("min_participants")}
                </label>
                <input
                  type="number"
                  value={
                    formData.min_participants === 0 ? "" : formData.min_participants
                  }
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const max = formData.max_participants || 0;
                    updateFormData({ min_participants: val > max ? max : val });
                  }}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: errors.min_participants
                      ? "1px solid rgba(239, 68, 68, 0.5)"
                      : "1px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                  }}
                />
                {errors.min_participants && (
                  <span
                    style={{
                      color: "#ef4444",
                      fontSize: "0.8rem",
                      marginTop: "0.5rem",
                      display: "block",
                      fontWeight: 700,
                    }}
                  >
                    {errors.min_participants.message}
                  </span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                  }}
                >
                  {t("max_participants")}
                </label>
                <input
                  type="number"
                  min="4"
                  max="32"
                  value={
                    formData.max_participants === 0
                      ? ""
                      : formData.max_participants
                  }
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const currentMin = formData.min_participants || 0;
                    const nextMax = val > 32 ? 32 : val;
                    updateFormData({
                      max_participants: nextMax,
                      min_participants: currentMin > nextMax ? nextMax : currentMin,
                      prize: (formData.prize || []).slice(0, nextMax),
                    });
                  }}
                  onBlur={(e) => {
                    let val = parseInt(e.target.value) || 0;
                    if (val < 4) val = 4;
                    if (val > 32) val = 32;
                    const currentMin = formData.min_participants || 0;
                    updateFormData({
                      max_participants: val,
                      min_participants: currentMin > val ? val : currentMin,
                      prize: (formData.prize || []).slice(0, val),
                    });
                  }}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: errors.max_participants
                      ? "1px solid rgba(239, 68, 68, 0.5)"
                      : "1px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                  }}
                />
                {errors.max_participants && (
                  <span
                    style={{
                      color: "#ef4444",
                      fontSize: "0.8rem",
                      marginTop: "0.5rem",
                      display: "block",
                      fontWeight: 700,
                    }}
                  >
                    {errors.max_participants.message}
                  </span>
                )}
              </div>
            </div>
            {formError && (
              <div
                style={{
                  color: "#ef4444",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  marginTop: "-0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                {formError}
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                  }}
                >
                  {t("date_time")}
                </label>
                {(() => {
                  const match = (formData.start_time || "").match(
                    /2026-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
                  );
                  const currentMonth = match ? match[1] : "06";
                  const currentDay = match ? match[2] : "01";
                  const currentHours = match ? match[3] : "22";
                  const currentMinutes = match ? match[4] : "00";

                  const updateDate = (
                    m: string,
                    d: string,
                    h: string,
                    min: string,
                  ) => {
                    const safeH = Math.min(
                      23,
                      parseInt(h.replace(/\D/g, "") || "0", 10),
                    )
                      .toString()
                      .padStart(2, "0");
                    const safeMin = Math.min(
                      59,
                      parseInt(min.replace(/\D/g, "") || "0", 10),
                    )
                      .toString()
                      .padStart(2, "0");
                    const safeD = Math.min(
                      31,
                      Math.max(1, parseInt(d.replace(/\D/g, "") || "1", 10)),
                    )
                      .toString()
                      .padStart(2, "0");
                    updateFormData({
                      start_time: `2026-${m.padStart(2, "0")}-${safeD}T${safeH}:${safeMin}`,
                    });
                  };

                  return (
                    <div
                      style={{ display: "flex", gap: "0.5rem", width: "100%" }}
                    >
                      <div
                        style={{
                          flex: 1.2,
                          display: "flex",
                          alignItems: "center",
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "0.75rem",
                          padding: "0 0.5rem",
                        }}
                      >
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={currentDay.replace(/^0+/, "") || ""}
                          onChange={(e) =>
                            updateDate(
                              currentMonth,
                              e.target.value,
                              currentHours,
                              currentMinutes,
                            )
                          }
                          style={{
                            width: "35px",
                            background: "transparent",
                            border: "none",
                            color: "#fff",
                            textAlign: "center",
                            padding: "0.75rem 0",
                            outline: "none",
                          }}
                        />
                        <span style={{ color: "rgba(255,255,255,0.3)" }}>
                          /
                        </span>
                        <select
                          value={currentMonth}
                          onChange={(e) =>
                            updateDate(
                              e.target.value,
                              currentDay,
                              currentHours,
                              currentMinutes,
                            )
                          }
                          style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            color: "#fff",
                            padding: "0.75rem 0.25rem",
                            outline: "none",
                            cursor: "pointer",
                            appearance: "none",
                            textAlign: "center",
                            fontSize: "0.85rem",
                          }}
                        >
                          <option value="01">Ene</option>
                          <option value="02">Feb</option>
                          <option value="03">Mar</option>
                          <option value="04">Abr</option>
                          <option value="05">May</option>
                          <option value="06">Jun</option>
                          <option value="07">Jul</option>
                          <option value="08">Ago</option>
                          <option value="09">Sep</option>
                          <option value="10">Oct</option>
                          <option value="11">Nov</option>
                          <option value="12">Dic</option>
                        </select>
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "0.75rem",
                          padding: "0.5rem",
                          justifyContent: "center",
                        }}
                      >
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={currentHours}
                          onChange={(e) =>
                            updateDate(
                              currentMonth,
                              currentDay,
                              e.target.value,
                              currentMinutes,
                            )
                          }
                          style={{
                            width: "36px",
                            background: "transparent",
                            border: "none",
                            color: "#fff",
                            textAlign: "center",
                            padding: "0",
                            outline: "none",
                            fontSize: "0.9rem",
                            fontWeight: 700,
                          }}
                        />
                        <span
                          style={{
                            color: "#fff",
                            fontWeight: 900,
                            fontSize: "1.1rem",
                            margin: "0 2px",
                            transform: "translateY(-3px)",
                          }}
                        >
                          :
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={currentMinutes}
                          onChange={(e) =>
                            updateDate(
                              currentMonth,
                              currentDay,
                              currentHours,
                              e.target.value,
                            )
                          }
                          style={{
                            width: "36px",
                            background: "transparent",
                            border: "none",
                            color: "#fff",
                            textAlign: "center",
                            padding: "0",
                            outline: "none",
                            fontSize: "0.9rem",
                            fontWeight: 700,
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                  }}
                >
                  {t("visibility")}
                </label>
                <select
                  value={formData.visibility || "public"}
                  onChange={(e) =>
                    updateFormData({ visibility: e.target.value as any })
                  }
                  style={{
                    width: "100%",
                    background:
                      "rgba(0,0,0,0.3) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\") no-repeat",
                    backgroundPosition: "right 1rem center",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    padding: "0.75rem 2.5rem 0.75rem 0.75rem",
                    borderRadius: "0.75rem",
                    appearance: "none",
                    WebkitAppearance: "none",
                  }}
                >
                  <option value="public">{t("public")}</option>
                  <option value="unlisted">{t("unlisted")}</option>
                  <option value="private">{t("private")}</option>
                </select>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                }}
              >
                Selecciones del Torneo (Elegí de 2 a 4)
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  marginTop: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                {[
                  { id: 'Argelia', flag: '🇩🇿', code: 'ALG' },
                  { id: 'Argentina', flag: '🇦🇷', code: 'ARG' },
                  { id: 'Austria', flag: '🇦🇹', code: 'AUT' },
                  { id: 'Bélgica', flag: '🇧🇪', code: 'BEL' },
                  { id: 'Bosnia y Herz', flag: '🇧🇦', code: 'BIH' },
                  { id: 'Brasil', flag: '🇧🇷', code: 'BRA' },
                  { id: 'Canadá', flag: '🇨🇦', code: 'CAN' },
                  { id: 'Colombia', flag: '🇨🇴', code: 'COL' },
                  { id: 'Croacia', flag: '🇭🇷', code: 'CRO' },
                  { id: 'República Checa', flag: '🇨🇿', code: 'CZE' },
                  { id: 'Ecuador', flag: '🇪🇨', code: 'ECU' },
                  { id: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG' },
                  { id: 'España', flag: '🇪🇸', code: 'ESP' },
                  { id: 'Francia', flag: '🇫🇷', code: 'FRA' },
                  { id: 'Alemania', flag: '🇩🇪', code: 'GER' },
                  { id: 'Japón', flag: '🇯🇵', code: 'JPN' },
                  { id: 'Corea del Sur', flag: '🇰🇷', code: 'KOR' },
                  { id: 'Marruecos', flag: '🇲🇦', code: 'MAR' },
                  { id: 'México', flag: '🇲🇽', code: 'MEX' },
                  { id: 'Países Bajos', flag: '🇳🇱', code: 'NED' },
                  { id: 'Noruega', flag: '🇳🇴', code: 'NOR' },
                  { id: 'Nueva Zelanda', flag: '🇳🇿', code: 'NZL' },
                  { id: 'Panamá', flag: '🇵🇦', code: 'PAN' },
                  { id: 'Paraguay', flag: '🇵🇾', code: 'PAR' },
                  { id: 'Portugal', flag: '🇵🇹', code: 'POR' },
                  { id: 'Qatar', flag: '🇶🇦', code: 'QAT' },
                  { id: 'Sudáfrica', flag: '🇿🇦', code: 'RSA' },
                  { id: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', code: 'SCO' },
                  { id: 'Suiza', flag: '🇨🇭', code: 'SUI' },
                  { id: 'Suecia', flag: '🇸🇪', code: 'SWE' },
                  { id: 'Uruguay', flag: '🇺🇾', code: 'URU' },
                  { id: 'USA', flag: '🇺🇸', code: 'USA' }
                ].map((team) => {
                  const allowedTeams = formData.allowed_teams || [];
                  const isChecked = allowedTeams.includes(team.id);
                  const isLimitReached = allowedTeams.length >= 4;
                  const isDisabled = !isChecked && isLimitReached;

                  return (
                    <button
                      key={team.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        const nextAllowed = isChecked
                          ? allowedTeams.filter(t => t !== team.id)
                          : [...allowedTeams, team.id];
                        updateFormData({ allowed_teams: nextAllowed });
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 1rem",
                        background: isChecked ? "rgba(255, 120, 0, 0.15)" : "rgba(0,0,0,0.3)",
                        border: isChecked
                          ? "2px solid #ff7800"
                          : "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "1rem",
                        color: "#fff",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        opacity: isDisabled ? 0.5 : 1,
                        fontSize: "0.9rem",
                        fontWeight: isChecked ? 900 : 600,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span>{team.flag}</span>
                      <span>{team.code}</span>
                      {isChecked && <span style={{ color: "#ff7800", marginLeft: "0.25rem" }}>✓</span>}
                    </button>
                  );
                })}
              </div>
              {errors.allowed_teams && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "0.8rem",
                    marginTop: "0.5rem",
                    display: "block",
                    fontWeight: 700,
                  }}
                >
                  {errors.allowed_teams.message}
                </span>
              )}
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                  }}
                >
                  {t("prize")}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (prizeFields.length >= maxPrizeSlots) return;
                    updateFormData({ prize: [...prizeFields, ""] });
                  }}
                  disabled={prizeFields.length >= maxPrizeSlots}
                  style={{
                    background:
                      prizeFields.length >= maxPrizeSlots
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(255, 120, 0, 0.15)",
                    border: "1px solid rgba(255, 120, 0, 0.3)",
                    color:
                      prizeFields.length >= maxPrizeSlots
                        ? "rgba(255,255,255,0.35)"
                        : "#ff7800",
                    padding: "0.45rem 0.75rem",
                    borderRadius: "0.75rem",
                    fontSize: "0.75rem",
                    fontWeight: 900,
                    cursor:
                      prizeFields.length >= maxPrizeSlots
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  + Agregar premio
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {prizeFields.map((prize, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        minWidth: "78px",
                        fontSize: "0.75rem",
                        fontWeight: 900,
                        color: "#ff7800",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {index + 1}º puesto
                    </div>
                    <input
                      type="text"
                      value={prize || ""}
                      onChange={(e) => {
                        const nextPrizes = [...prizeFields];
                        nextPrizes[index] = e.target.value;
                        updateFormData({ prize: nextPrizes });
                      }}
                      placeholder={`Premio para el ${index + 1}º puesto`}
                      style={{
                        flex: 1,
                        background: "rgba(0,0,0,0.3)",
                        border: errors.prize
                          ? "1px solid rgba(239, 68, 68, 0.5)"
                          : "1px solid rgba(255,255,255,0.2)",
                        color: "#fff",
                        padding: "0.75rem",
                        borderRadius: "0.75rem",
                      }}
                    />
                    {prizeFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateFormData({
                            prize: prizeFields.filter(
                              (_, prizeIndex) => prizeIndex !== index,
                            ),
                          })
                        }
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "0.75rem",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: 900,
                        }}
                        aria-label={`Eliminar premio ${index + 1}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {errors.prize && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "0.8rem",
                    marginTop: "0.5rem",
                    display: "block",
                    fontWeight: 700,
                  }}
                >
                  {errors.prize.message}
                </span>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                }}
              >
                Descripción (opcional)
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  updateFormData({ description: e.target.value })
                }
                rows={3}
                placeholder="Descripción del torneo, reglas, formato..."
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  resize: "vertical",
                  fontFamily: "inherit",
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                }}
              >
                {t("access_code_type")}
              </label>
              <select
                value={formData.code_type || "single"}
                onChange={(e) =>
                  updateFormData({ code_type: e.target.value as any })
                }
                style={{
                  width: "100%",
                  background:
                    "rgba(0,0,0,0.3) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\") no-repeat",
                  backgroundPosition: "right 1rem center",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  padding: "0.75rem 2.5rem 0.75rem 0.75rem",
                  borderRadius: "0.75rem",
                  appearance: "none",
                  WebkitAppearance: "none",
                }}
              >
                <option value="single">{t("same_code_for_all")}</option>
                <option value="unique">
                  {t("unique_code_per_participant")}
                </option>
              </select>
            </div>

            <button
              onClick={handleSubmit(onSubmit)}
              style={{
                background: "#ff7800",
                border: "none",
                color: "#000",
                height: "48px",
                borderRadius: "1rem",
                fontSize: "1rem",
                fontWeight: 900,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "1rem",
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <Save size={18} />
              {t("save")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
