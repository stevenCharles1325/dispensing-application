import { useReducer } from 'react';
import { TextField, Autocomplete } from '@mui/material';
import useAlert from 'UI/hooks/useAlert';

export default function SupplierForm() {
  const { displayAlert } = useAlert();

  const initialForm = {
    system_id: '123', // Sample System-ID
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
        />
        <TextField
          label="Phone Number"
          value={form.phone_number}
          onChange={(event) => {
            dispatch({ type: 'phone_number', payload: event.target.value });
          }}
          variant="outlined"
          size="small"
          sx={{
            width: 300,
          }}
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
        />
        <TextField
          label="Contact Phone Number"
          value={form.contact_phone_number}
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
        />
      </div>
    </div>
  );
}
