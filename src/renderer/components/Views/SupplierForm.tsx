/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable consistent-return */
import { useReducer, useState } from 'react';
import { TextField, Button } from '@mui/material';
import useAlert from 'UI/hooks/useAlert';
import SupplierDTO from 'App/data-transfer-objects/supplier.dto';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';

interface SupplierFormProps {
  getSuppliers: () => Promise<void>;
}

export default function SupplierForm({ getSuppliers }: SupplierFormProps) {
  const { displayAlert } = useAlert();
  const [errors, setErrors] = useState<Record<string, any>>({});

  const initialForm = {
    system_id: null, // Sample System-ID
    image_id: null,
    tax_id: '',
    name: '',
    email: '',
    phone_number: '',
    contact_name: '',
    contact_email: '',
    contact_phone_number: '',
    address: '',
    status: 'active',
  } as const;

  const formReducer = (
    state: typeof initialForm,
    action: {
      type: keyof typeof initialForm;
      payload: any;
    }
  ) => {
    switch (action.type) {
      case 'system_id':
        return {
          ...state,
          system_id: action.payload,
        };
      case 'image_id':
        return {
          ...state,
          image_id: action.payload,
        };
      case 'tax_id':
        return {
          ...state,
          tax_id: action.payload,
        };
      case 'name':
        return {
          ...state,
          name: action.payload,
        };
      case 'email':
        return {
          ...state,
          email: action.payload,
        };
      case 'phone_number':
        return {
          ...state,
          phone_number: action.payload,
        };
      case 'contact_name':
        return {
          ...state,
          contact_name: action.payload,
        };
      case 'contact_email':
        return {
          ...state,
          contact_email: action.payload,
        };
      case 'contact_phone_number':
        return {
          ...state,
          contact_phone_number: action.payload,
        };
      case 'address':
        return {
          ...state,
          address: action.payload,
        };
      default:
        return state;
    }
  };

  const [form, dispatch] = useReducer(formReducer, initialForm);

  const handleAddNewSupplier = async () => {
    const res = await window.supplier.createSupplier(
      form as unknown as SupplierDTO
    );

    if (res.status === 'ERROR') {
      if (typeof res.errors?.[0] === 'string') {
        return displayAlert?.(
          (res.errors?.[0] as string) ?? 'Please try again',
          'error'
        );
      }

      const errors: Record<string, any> = {};
      const resErrors = res.errors as unknown as IPOSValidationError[];
      for (const error of resErrors) {
        errors[error.field] = error.message;
      }

      return setErrors(errors);
    }

    await getSuppliers();
  };

  return (
    <div className="w-full h-fit">
      <h3>Supplier Information</h3>
      <br />
      <div className="w-full flex flex-wrap gap-7">
        <TextField
          label="Tax ID"
          value={form.tax_id}
          onChange={(event) => {
            dispatch({ type: 'tax_id', payload: event.target.value });
          }}
          variant="outlined"
          size="small"
          sx={{
            width: 300,
          }}
          helperText={errors.tax_id}
          error={Boolean(errors.tax_id)}
        />
        <TextField
          label="Name"
          value={form.name}
          onChange={(event) => {
            dispatch({ type: 'name', payload: event.target.value });
          }}
          variant="outlined"
          size="small"
          sx={{
            width: 300,
          }}
          helperText={errors.name}
          error={Boolean(errors.name)}
        />
        <TextField
          label="Email"
          value={form.email}
          onChange={(event) => {
            dispatch({ type: 'email', payload: event.target.value });
          }}
          variant="outlined"
          size="small"
          sx={{
            width: 300,
          }}
          helperText={errors.email}
          error={Boolean(errors.email)}
        />
        <TextField
          label="Phone Number"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          value={form.phone_number}
          placeholder="+63912345689"
          onChange={(event) => {
            dispatch({ type: 'phone_number', payload: event.target.value });
          }}
          variant="outlined"
          size="small"
          sx={{
            width: 300,
          }}
          helperText={errors.phone_number}
          error={Boolean(errors.phone_number)}
        />
        <TextField
          label="Contact Name"
          value={form.contact_name}
          onChange={(event) => {
            dispatch({ type: 'contact_name', payload: event.target.value });
          }}
          variant="outlined"
          size="small"
          sx={{
            width: 300,
          }}
          helperText={errors.contact_name}
          error={Boolean(errors.contact_name)}
        />
        <TextField
          label="Contact Email"
          value={form.contact_email}
          onChange={(event) => {
            dispatch({ type: 'contact_email', payload: event.target.value });
          }}
          variant="outlined"
          size="small"
          sx={{
            width: 300,
          }}
          helperText={errors.contact_email}
          error={Boolean(errors.contact_email)}
        />
        <TextField
          label="Contact Phone Number"
          placeholder="+63912345689"
          value={form.contact_phone_number}
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          onChange={(event) => {
            dispatch({
              type: 'contact_phone_number',
              payload: event.target.value,
            });
          }}
          variant="outlined"
          size="small"
          sx={{
            width: 300,
          }}
          helperText={errors.contact_phone_number}
          error={Boolean(errors.contact_phone_number)}
        />
        <TextField
          label="Address"
          value={form.address}
          onChange={(event) => {
            dispatch({ type: 'address', payload: event.target.value });
          }}
          variant="outlined"
          size="small"
          sx={{
            width: 300,
          }}
          helperText={errors.address}
          error={Boolean(errors.address)}
        />
      </div>
      <br />
      <Button variant="outlined" size="small" onClick={handleAddNewSupplier}>
        Add
      </Button>
    </div>
  );
}
