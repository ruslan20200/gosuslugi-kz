import { useEffect, useMemo, useState } from "react";

export interface UserData {
  firstName: string;
  lastName: string;
  middleName: string;
  iin: string;
  birthDate: string; // format DD.MM.YYYY
  docNumber: string;
  issueDate: string;
  expiryDate: string;
  birthPlace: string;
  nationality: string;
  photo?: string; // base64
  pdf?: string; // base64 or url
}

export const DEFAULT_USER_DATA: UserData = {
  firstName: "ИВАН",
  lastName: "ИВАНОВ",
  middleName: "ИВАНОВИЧ",
  iin: "990101123456",
  birthDate: "18.09.2007",
  docNumber: "123456789",
  issueDate: "27.06.2024",
  expiryDate: "26.06.2034",
  birthPlace: "АЛМАТЫ",
  nationality: "КАЗАХ",
};

const STORAGE_KEY = "gosuslugi_user_data";

export function useUserData() {
  const [data, setData] = useState<UserData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as UserData;
    } catch (err) {
      console.warn("Failed to read user data", err);
    }
    return DEFAULT_USER_DATA;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("Failed to save user data", err);
    }
  }, [data]);

  const actions = useMemo(() => {
    const update = (partial: Partial<UserData>) =>
      setData((prev) => ({ ...prev, ...partial }));

    const reset = () => {
      localStorage.removeItem(STORAGE_KEY);
      setData(DEFAULT_USER_DATA);
    };

    return { update, reset };
  }, []);

  return { data, setData, ...actions };
}
