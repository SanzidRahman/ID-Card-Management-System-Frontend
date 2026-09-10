'use client';
import { useController, useForm } from 'react-hook-form';
import { FormField, inputClass, selectClass } from './ui';

const FIELD_TYPES = [
  'text', 'textarea', 'number', 'email', 'phone', 'date',
  'select', 'multi_select', 'checkbox', 'radio', 'image', 'file', 'url',
];

function DynamicField({ field, control, error }) {
  const { field: rhfField } = useController({
    name: field.name,
    control,
    rules: {
      required: field.required ? `${field.label} is required` : false,
      ...(field.validation?.minLength && { minLength: { value: field.validation.minLength, message: `Min ${field.validation.minLength} characters` } }),
      ...(field.validation?.maxLength && { maxLength: { value: field.validation.maxLength, message: `Max ${field.validation.maxLength} characters` } }),
      ...(field.validation?.min != null && { min: { value: field.validation.min, message: `Min value is ${field.validation.min}` } }),
      ...(field.validation?.max != null && { max: { value: field.validation.max, message: `Max value is ${field.validation.max}` } }),
      ...(field.validation?.pattern && { pattern: { value: new RegExp(field.validation.pattern), message: 'Invalid format' } }),
    },
    defaultValue: field.type === 'checkbox' ? false : field.type === 'multi_select' ? [] : '',
  });

  const { onChange, value, ref, ...rest } = rhfField;

  const baseInput = (
    <input
      {...rest}
      ref={ref}
      value={value ?? ''}
      onChange={onChange}
      type={
        field.type === 'phone' ? 'tel'
          : field.type === 'image' || field.type === 'file' ? 'file'
            : field.type === 'url' ? 'url'
              : field.type === 'date' ? 'date'
                : field.type === 'number' ? 'number'
                  : field.type === 'email' ? 'email'
                    : 'text'
      }
      placeholder={field.placeholder || field.label}
      className={inputClass}
      accept={field.type === 'image' ? 'image/*' : undefined}
    />
  );

  if (field.type === 'textarea') {
    return (
      <FormField label={field.label} required={field.required} error={error?.message} hint={field.description}>
        <textarea
          {...rest}
          ref={ref}
          value={value ?? ''}
          onChange={onChange}
          rows={4}
          placeholder={field.placeholder || field.label}
          className={inputClass + ' resize-none'}
        />
      </FormField>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <FormField error={error?.message} hint={field.description}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            {...rest}
            ref={ref}
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-300">
            {field.label}
            {field.required && <span className="ml-1 text-red-400">*</span>}
          </span>
        </label>
      </FormField>
    );
  }

  if (field.type === 'radio') {
    return (
      <FormField label={field.label} required={field.required} error={error?.message} hint={field.description}>
        <div className="flex flex-wrap gap-4 pt-1">
          {(field.options || []).map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
              <input
                type="radio"
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="h-4 w-4 border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </FormField>
    );
  }

  if (field.type === 'select') {
    return (
      <FormField label={field.label} required={field.required} error={error?.message} hint={field.description}>
        <select
          {...rest}
          ref={ref}
          value={value ?? ''}
          onChange={onChange}
          className={selectClass}
        >
          <option value="">Select {field.label}</option>
          {(field.options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </FormField>
    );
  }

  if (field.type === 'multi_select') {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (v) => {
      onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);
    };
    return (
      <FormField label={field.label} required={field.required} error={error?.message} hint={field.description}>
        <div className="flex flex-wrap gap-2 pt-1">
          {(field.options || []).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${selected.includes(opt.value)
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FormField>
    );
  }

  if (field.type === 'image' || field.type === 'file') {
    return (
      <FormField label={field.label} required={field.required} error={error?.message} hint={field.description}>
        <input
          {...rest}
          ref={ref}
          type="file"
          accept={field.type === 'image' ? 'image/*' : undefined}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className={inputClass + ' file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer'}
        />
      </FormField>
    );
  }

  return (
    <FormField label={field.label} required={field.required} error={error?.message} hint={field.description}>
      {baseInput}
    </FormField>
  );
}

export default function DynamicForm({ fields = [], onSubmit, submitting = false, initialValues = {}, submitLabel = 'Save Record' }) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialValues,
  });

  const handleFormSubmit = (data) => {
    // Check if any file field is present → use FormData
    const hasFile = fields.some((f) => (f.type === 'image' || f.type === 'file') && data[f.name] instanceof File);
    if (hasFile) {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v instanceof File) fd.append(k, v);
        else if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else if (v != null) fd.append(k, v);
      });
      onSubmit(fd);
    } else {
      onSubmit(data);
    }
  };

  if (!fields.length) {
    return (
      <div className="rounded-xl border border-slate-700/50 border-dashed bg-slate-900/30 px-6 py-12 text-center text-sm text-slate-500">
        No fields defined for this catalog. Add fields first.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {fields
          .filter((f) => f.isActive !== false)
          .map((field) => (
            <div key={field._id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
              <DynamicField field={field} control={control} error={errors[field.name]} />
            </div>
          ))}
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 hover:bg-blue-500 transition-colors disabled:opacity-50"
        >
          {submitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
