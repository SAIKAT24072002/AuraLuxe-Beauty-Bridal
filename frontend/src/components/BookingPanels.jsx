import { useState } from "react";
import BridalBookingWizard from "./BridalBookingWizard";
import BookingSummaryCard from "./BookingSummaryCard";

const beautyDefaults = {
  service: "Silk Repair Hair Spa",
  date: "2026-08-18",
  time: "2:00 PM - 3:15 PM",
  persons: "1",
};

export function BeautyBookingPanel() {
  const [form, setForm] = useState(beautyDefaults);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[2rem] border border-rosewood/10 bg-white p-6 shadow-panel">
        <h3 className="font-display text-3xl">Beauty Appointment UI</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Service</span>
            <select
              value={form.service}
              onChange={(event) =>
                setForm((current) => ({ ...current, service: event.target.value }))
              }
              className="w-full rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
            >
              <option>Silk Repair Hair Spa</option>
              <option>Glass Skin Facial</option>
              <option>Classic Party Makeup</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((current) => ({ ...current, date: event.target.value }))
              }
              className="w-full rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Time Slot</span>
            <select
              value={form.time}
              onChange={(event) =>
                setForm((current) => ({ ...current, time: event.target.value }))
              }
              className="w-full rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
            >
              <option>11:00 AM - 12:15 PM</option>
              <option>2:00 PM - 3:15 PM</option>
              <option>5:00 PM - 6:15 PM</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Number of Persons</span>
            <input
              type="number"
              min="1"
              value={form.persons}
              onChange={(event) =>
                setForm((current) => ({ ...current, persons: event.target.value }))
              }
              className="w-full rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-medium">Notes</span>
            <textarea
              rows="4"
              placeholder="Any skin, hair, or timing preferences..."
              className="w-full rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
            />
          </label>
        </div>
      </div>

      <BookingSummaryCard
        title="Payment Summary"
        lines={[
          { label: "Selected Service", value: form.service },
          { label: "Date", value: form.date },
          { label: "Slot", value: form.time },
          { label: "Persons", value: form.persons },
        ]}
        total="Rs 1,800"
        advance="Rs 900"
      />
    </div>
  );
}

export function BridalBookingPanel({ bridalPackages = [], initialPackage, onBookingCreated }) {
  return (
    <BridalBookingWizard
      bridalPackages={bridalPackages}
      initialPackage={initialPackage}
      onBookingCreated={onBookingCreated}
    />
  );
}
