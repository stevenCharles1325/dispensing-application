import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Step,
  StepLabel,
  Stepper,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import SystemDTO from 'App/data-transfer-objects/system.dto';
import UserDTO from 'App/data-transfer-objects/user.dto';
import PasswordInput from 'UI/components/TextField/PasswordInput';
import useConfirm from 'UI/hooks/useConfirm';
import useErrorHandler from 'UI/hooks/useErrorHandler';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const steps = ['Setup system information', 'Create an owner/manager account'];

const CACHE_KEY = 'SYSTEM-SETUP:PROGRESS';

interface IProgressCache {
  progress: 'SETUP:SYSTEM' | 'SETUP:USER',
  system: Partial<SystemDTO>,
}

const initialProgress: IProgressCache = {
  progress: 'SETUP:SYSTEM',
  system: {}
}

export default function Setup () {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const errorHandler = useErrorHandler();
  const [systemForm, setSystemForm] = useState<Partial<SystemDTO>>({
    is_main: false,
    auto_sync: true,
  });
  const [progress, setProgress] = useState<IProgressCache>(initialProgress);
  const [userForm, setUserForm] = useState<Partial<UserDTO>>({
    role_id: process.env.DEFAULT_OWNER_ROLE_ID
  });
  const [system, setSystem] = useState<Partial<SystemDTO>>({});
  const [systemFormErrors, setSystemFormErrors] = useState<Record<string, string>>({});
  const [userFormErrors, setUserFormErrors] = useState<Record<string, string>>({});

  const [activeStep, setActiveStep] = useState(0);

  const handleSystemFormUpdate =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
    setSystemForm((systemForm) => ({
      ...systemForm,
      [field]: e.target.value
    }));
  }

  const handleUserFormUpdate =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserForm((userForm) => ({
      ...userForm,
      [field]: e.target.value
    }));
  }

  const handleCreateSystem = useCallback(async (cb: Function) => {
    if (progress.progress === 'SETUP:USER') return cb?.();

    confirm?.(
      'Are you sure you want to submit? Once you submit you will not be able to edit all system information.',
      async (agreed) => {
        if (agreed) {

          const res = await window.system.createSystem(systemForm);

          if (res.status === 'ERROR') {
            const errors: Record<string, string> = {};

            const onError = (field: string | null, message: string) => {
              if (field) {
                errors[field] = message;
              }
            }

            errorHandler({
              errors: res.errors,
              onError,
            });

            setSystemFormErrors(errors);

            return;
          }

          setSystem(res.data as SystemDTO);
          setProgress({
            progress: 'SETUP:USER',
            system: res.data as SystemDTO,
          });
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            progress: 'SETUP:USER',
            system: res.data,
          }));

          setSystemFormErrors({});
          return cb?.();
        }
      }
    )
  }, [navigate, systemForm, progress]);

  const handleCreateUser = useCallback(async () => {
    const res = await window.user.createUser({
      ...userForm,
      system_id: system.id,
    }, process.env.SYSTEM_KEY);

    if (res.status === 'ERROR') {
      const errors: Record<string, string> = {};

      const onError = (field: string | null, message: string) => {
        if (field) {
          errors[field] = message;
        }
      }

      errorHandler({
        errors: res.errors,
        onError,
      });

      setUserFormErrors(errors);
      return;
    }

    localStorage.removeItem(CACHE_KEY);
    return navigate('/', { replace: true });
  }, [navigate, userForm, system]);

  const handleNext = useCallback(async () => {
    if (activeStep === 0) {
      await handleCreateSystem(() => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      });
    }

    if (activeStep === 1) {
      await handleCreateUser();
    }
  }, [activeStep, handleCreateSystem, handleCreateUser]);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  useEffect(() => {
    const progressStr = localStorage.getItem(CACHE_KEY) as string;

    if (progressStr && progressStr.length) {
      const progressCache = JSON.parse(progressStr) as IProgressCache;
      setProgress(progressCache ?? initialProgress);

      if (progressCache) {
        switch (progressCache.progress) {
          case 'SETUP:SYSTEM':
            setActiveStep(0);
            break;

          case 'SETUP:USER':
            setActiveStep(1);
            setSystem(progressCache.system);
            break;

          default:
            setActiveStep(0);
            break;
        }
      } else {
        setActiveStep(0);
      }
    }
  }, []);

  // useEffect(() => {
  //   localStorage.clear();
  // }, []);

  useEffect(() => {
    setSystemForm({ ...system });
  }, [system]);

  return (
    <div className="w-screen h-screen flex justify-center items-center shadow-inner">
      <div className="w-[700px] h-fit bg-white shadow rounded p-5">
        <p className="text-2xl">Setup</p>
        <br />
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            return (
              <Step
                key={label}
                sx={{
                  '& .Mui-active, .Mui-completed': {
                    color: '#9c27b0 !important'
                  }
                }}
              >
                <StepLabel color='secondary'>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <br />
        {
          activeStep === 0
          ? (
            <div className='mt-2 w-full h-fit flex flex-col gap-5'>
              <TextField
                required
                fullWidth
                autoFocus
                disabled={progress.progress === 'SETUP:USER'}
                value={systemForm.store_name ?? ''}
                size="small"
                label="Store Name"
                color="secondary"
                error={Boolean(systemFormErrors.store_name)}
                helperText={systemFormErrors.store_name}
                onChange={handleSystemFormUpdate('store_name')}
              />
              <TextField
                required
                disabled={progress.progress === 'SETUP:USER'}
                fullWidth
                value={systemForm.phone_number ?? ''}
                size="small"
                label="Phone Number"
                error={Boolean(systemFormErrors.phone_number)}
                placeholder='+639123456789'
                helperText={systemFormErrors.phone_number}
                color="secondary"
                onChange={handleSystemFormUpdate('phone_number')}
              />
              <TextField
                required
                disabled={progress.progress === 'SETUP:USER'}
                fullWidth
                value={systemForm.email ?? ''}
                size="small"
                label="Email"
                color="secondary"
                error={Boolean(systemFormErrors.email)}
                helperText={systemFormErrors.email}
                onChange={handleSystemFormUpdate('email')}
              />
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={systemForm.is_main ?? false}
                      disabled={progress.progress === 'SETUP:USER'}
                      color="secondary"
                      onChange={(e) => {
                        setSystemForm((systemForm) => ({
                          ...systemForm,
                          main_branch_id: e.target.checked ? '' : systemForm.main_branch_id,
                          is_main: e.target.checked
                        }));
                      }}
                    />
                  }
                  label="Main Branch"
                />
              </FormGroup>
              <TextField
                required
                fullWidth
                value={systemForm.main_branch_id ?? ''}
                disabled={systemForm.is_main || progress.progress === 'SETUP:USER'}
                size="small"
                label="Main Branch System ID"
                color="secondary"
                error={Boolean(systemFormErrors.main_branch_id)}
                helperText={systemFormErrors.main_branch_id}
                onChange={handleSystemFormUpdate('main_branch_id')}
              />
              <TextField
                required
                fullWidth
                disabled={progress.progress === 'SETUP:USER'}
                value={systemForm.master_key ?? ''}
                size="small"
                label="Master Key"
                color="secondary"
                error={Boolean(systemFormErrors.master_key)}
                helperText={systemFormErrors.master_key}
                type={progress.progress === 'SETUP:USER' ? 'password' : 'text'}
                onChange={handleSystemFormUpdate('master_key')}
              />
              <TextField
                fullWidth
                disabled={progress.progress === 'SETUP:USER'}
                value={systemForm.api_url ?? ''}
                size="small"
                label="API Url"
                color="secondary"
                error={Boolean(systemFormErrors.api_url)}
                helperText={systemFormErrors.api_url}
                onChange={handleSystemFormUpdate('api_url')}
              />
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="secondary"
                      disabled={progress.progress === 'SETUP:USER'}
                      checked={systemForm.auto_sync ?? true}
                      onChange={(e) => {
                        setSystemForm((systemForm) => ({
                          ...systemForm,
                          auto_sync: e.target.checked
                        }));
                      }}
                    />
                  }
                  label="Auto Sync"
                />
              </FormGroup>
            </div>
          )
          : (
            <div className='mt-2 w-full h-fit flex flex-col gap-5'>
              <TextField
                required
                fullWidth
                autoFocus
                value={userForm.first_name ?? ''}
                size="small"
                label="First Name"
                color="secondary"
                error={Boolean(userFormErrors.first_name)}
                helperText={userFormErrors.first_name}
                onChange={handleUserFormUpdate('first_name')}
              />
              <TextField
                required
                fullWidth
                value={userForm.last_name ?? ''}
                size="small"
                label="Last Name"
                color="secondary"
                error={Boolean(userFormErrors.last_name)}
                helperText={userFormErrors.last_name}
                onChange={handleUserFormUpdate('last_name')}
              />
              <TextField
                required
                fullWidth
                value={userForm.phone_number ?? ''}
                size="small"
                label="Phone Number"
                error={Boolean(userFormErrors.phone_number)}
                placeholder='+639123456789'
                helperText={userFormErrors.phone_number}
                color="secondary"
                onChange={handleUserFormUpdate('phone_number')}
              />
              <TextField
                required
                fullWidth
                value={userForm.email ?? ''}
                size="small"
                label="Email"
                color="secondary"
                error={Boolean(userFormErrors.email)}
                helperText={userFormErrors.email}
                onChange={handleUserFormUpdate('email')}
              />
              <TextField
                fullWidth
                value={userForm.address ?? ''}
                size="small"
                label="Address"
                color="secondary"
                error={Boolean(userFormErrors.address)}
                helperText={userFormErrors.address}
                onChange={handleUserFormUpdate('address')}
              />
              <DatePicker
                label="Birth-date"
                views={['year', 'month', 'day']}
                value={dayjs(userForm.birth_date)}
                onChange={(value) => {
                  if (!value) return;

                  setUserForm((userForm) => ({
                    ...userForm,
                    birth_date: new Date(value.toString()),
                  }))
                }}
                slotProps={{
                  textField: {
                    helperText: userFormErrors['birth_date'] ?? 'Birth-date',
                    error: Boolean(userFormErrors['birth_date']),
                    size: 'small',
                    color: 'secondary'
                  }
                }}
              />
              <PasswordInput
                required
                fullWidth
                value={userForm.password ?? ''}
                size="small"
                label="Password"
                color="secondary"
                error={Boolean(userFormErrors.password)}
                helperText={userFormErrors.password}
                onChange={handleUserFormUpdate('password') as any}
              />
            </div>
          )
        }
        <div className="mt-5 flex flex-row-reverse">
          <Button
            onClick={handleNext}
          >
            {
              activeStep < steps.length - 1
              ? 'Next'
              : 'Submit'
            }
          </Button>
          <Button
            disabled={Boolean(activeStep <= 0)}
            onClick={handleBack}
          >
            Previous
          </Button>
        </div>
      </div>
    </div>
  );
}




