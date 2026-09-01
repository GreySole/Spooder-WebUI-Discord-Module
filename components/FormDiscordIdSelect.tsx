import { faKeyboard, faListUl } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  FormSelectDropdown,
  FormTextInput,
  TypeFace,
} from '@spooder/webui-component-library';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { SelectOption } from '@spooder/webui-module-sdk';
import { FIELD_BUTTON_ICON_SIZE, FIELD_BUTTON_STYLE } from './discordPickerOptions';

interface FormDiscordIdSelectProps {
  formKey: string;
  label?: string;
  options: SelectOption[];
  // True while the guild list is still in flight: the value can't be checked against the
  // options yet, so the control mustn't decide it is an unknown id (see below).
  isLoading?: boolean;
  // Shown in place of the dropdown when there is nothing to pick from.
  emptyMessage: string;
  manualPlaceholder: string;
}

// One id, picked from what the bot can see or typed in by hand.
//
// The dropdown is the default because a Discord id is an 18-digit number that says nothing
// about what it points at, and getting one wrong fails silently at run time. Manual entry stays
// reachable for the cases the list can't cover - a guild the bot joined since the cache was
// built, or an id copied out of Discord's own developer mode - and is not a second field: both
// modes write the same form key, so there is never a stale value hiding behind the other one.
//
// A value that isn't in the list puts the control in manual mode on its own. That is the state
// a hand-typed id is already in, and it means an id that stops resolving (the bot is removed
// from a guild) stays visible and editable instead of silently reading as 'Select Guild'.
export default function FormDiscordIdSelect(props: FormDiscordIdSelectProps) {
  const { formKey, label, options, isLoading, emptyMessage, manualPlaceholder } = props;
  const { watch, setValue } = useFormContext();
  const [preferManual, setPreferManual] = useState(false);
  const value = watch(formKey, '') ?? '';

  const known = options.some((option) => option.value === value);
  // Gated on isLoading: mid-fetch every value looks unknown, and without this the control
  // would flip to manual on first paint and stay there once the list arrived.
  const showManual = preferManual || (!isLoading && value !== '' && !known);
  // The placeholder entry is always present, so anything shorter has nothing real in it.
  const hasOptions = options.length > 1;

  function toggleManual() {
    // Leaving manual mode with an id the list doesn't contain would show the placeholder while
    // the field still held that id - clearing it keeps the control and the value saying the
    // same thing.
    if (showManual && !known) {
      setValue(formKey, '', { shouldDirty: true });
    }
    setPreferManual(!showManual);
  }

  return (
    <div>
      {label ? <TypeFace>{label}</TypeFace> : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          {showManual || !hasOptions ? (
            <FormTextInput formKey={formKey} placeholder={manualPlaceholder} />
          ) : (
            <FormSelectDropdown formKey={formKey} options={options} />
          )}
        </div>
        <Button
          icon={showManual || !hasOptions ? faListUl : faKeyboard}
          iconSize={FIELD_BUTTON_ICON_SIZE}
          style={FIELD_BUTTON_STYLE}
          disabled={!hasOptions}
          tooltipText={
            !hasOptions
              ? emptyMessage
              : showManual
                ? 'Pick from the list instead'
                : 'Enter an ID manually'
          }
          onClick={toggleManual}
        />
      </div>
    </div>
  );
}
