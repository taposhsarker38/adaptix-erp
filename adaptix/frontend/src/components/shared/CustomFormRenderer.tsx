"use client";

import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

export interface UISchemaSelection {
  label: string;
  value: string;
}

export interface UISchemaField {
  id: string;
  code: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "boolean" | "textarea";
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: UISchemaSelection[];
  defaultValue?: any;
}

export interface UISchemaSection {
  id: string;
  title: string;
  description?: string;
  fields: UISchemaField[];
}

export interface UISchema {
  sections: UISchemaSection[];
}

interface CustomFormRendererProps {
  form: UseFormReturn<any>;
  schema: UISchema;
  basePath?: string;
}

export const CustomFormRenderer: React.FC<CustomFormRendererProps> = ({
  form,
  schema,
  basePath = "custom_data",
}) => {
  if (!schema || !schema.sections) return null;

  return (
    <div className="space-y-8">
      {schema.sections.map((section) => (
        <div key={section.id} className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-semibold">{section.title}</h3>
            {section.description && (
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.fields.map((field) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`${basePath}.${field.code}`}
                render={({ field: fieldProps }) => (
                  <FormItem
                    className={field.type === "textarea" ? "col-span-full" : ""}
                  >
                    <FormLabel>
                      {field.label}
                      {field.required && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </FormLabel>
                    <FormControl>{renderInput(field, fieldProps)}</FormControl>
                    {field.description && (
                      <FormDescription>{field.description}</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

function renderInput(field: UISchemaField, fieldProps: any) {
  switch (field.type) {
    case "text":
      return (
        <Input
          placeholder={field.placeholder || field.label}
          {...fieldProps}
          value={fieldProps.value || ""}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          placeholder={field.placeholder || field.label}
          {...fieldProps}
          value={fieldProps.value || ""}
          onChange={(e) => fieldProps.onChange(parseFloat(e.target.value))}
        />
      );
    case "date":
      return (
        <Input type="date" {...fieldProps} value={fieldProps.value || ""} />
      );
    case "textarea":
      return (
        <Textarea
          placeholder={field.placeholder || field.label}
          {...fieldProps}
          value={fieldProps.value || ""}
        />
      );
    case "boolean":
      return (
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            checked={!!fieldProps.value}
            onCheckedChange={fieldProps.onChange}
          />
          <span className="text-sm font-normal">Enabled</span>
        </div>
      );
    case "select":
      return (
        <Select
          onValueChange={fieldProps.onChange}
          value={fieldProps.value || ""}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={field.placeholder || `Select ${field.label}`}
            />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    default:
      return <Input {...fieldProps} value={fieldProps.value || ""} />;
  }
}
