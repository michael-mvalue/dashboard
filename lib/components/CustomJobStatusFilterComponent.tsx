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

const TAG_OPTIONS = ["running", "pending", "completed"];

function CustomTagFilterComponentFunc(
  props: IFilterParams,
  ref: React.Ref<any>
) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const onTagChange = (tag: string, checked: boolean) => {
    const updated = new Set(selectedTags);

    checked ? updated.add(tag) : updated.delete(tag);
    setSelectedTags(updated);
  };

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

      const status = String(params.data?.[field]).trim();

      return selectedTags.has(status);
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
      <CheckboxGroup
        defaultValue={[]}
        label="Status filter"
        value={Array.from(selectedTags)}
        onValueChange={(values: string[]) => setSelectedTags(new Set(values))}
      >
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
