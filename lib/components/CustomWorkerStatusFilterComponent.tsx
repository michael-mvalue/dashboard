import React, {
  useState,
  useImperativeHandle,
  useEffect,
  forwardRef,
} from "react";
import { IFilterParams } from "ag-grid-community";
import { CheckboxGroup, Checkbox } from "@heroui/checkbox";

interface CustomTagFilterModel {
  value: string[];
}

const TAG_OPTIONS = ["idle", "busy"];

function CustomTagFilterComponentFunc(
  props: IFilterParams,
  ref: React.Ref<any>,
) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    props.filterChangedCallback?.();
  }, [selectedTags]);

  useImperativeHandle(ref, () => ({
    isFilterActive() {
      return selectedTags.size > 0;
    },

    doesFilterPass(params: any) {
      const field = props.colDef.field;

      if (!field) return false;

      const fieldValue = params.data?.[field];

      const tags: string[] = Array.isArray(fieldValue)
        ? fieldValue
        : typeof fieldValue === "string"
          ? fieldValue.split(",").map((t) => t.trim())
          : [];

      return Array.from(selectedTags).every((tag) => tags.includes(tag));
    },

    getModel() {
      return selectedTags.size > 0 ? { value: Array.from(selectedTags) } : null;
    },

    setModel(model: CustomTagFilterModel | null) {
      setSelectedTags(new Set(model?.value || []));
    },
  }));

  return (
    <div className="p-2">
      <CheckboxGroup defaultValue={["idle", "busy"]} label="Status filter">
        {TAG_OPTIONS.map((tag) => (
          <Checkbox key={tag} value={tag}>
            {tag}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </div>
  );
}

export default forwardRef(CustomTagFilterComponentFunc);
