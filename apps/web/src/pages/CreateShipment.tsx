import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller, UseFormRegister, FieldErrors } from 'react-hook-form';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Truck, DollarSign, MapPin, Package, Box, Plus, Trash2 } from 'lucide-react';
import { useShipmentStore } from '@/hooks/useShipmentStore';
import { useAuth } from '@/features/auth/hooks';
import type { Shipment, Currency, PackageType, ServiceType } from '@/types/shipment';
import { AWBStatusBadge } from '@/components/tracking/AWBStatusBadge';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

type ShipmentFormData = Omit<Shipment, 'id' | 'awbNumber' | 'createdAt'>;

const CURRENCIES: Currency[] = ['USD', 'EUR', 'ETB', 'CNY'];

// ✅ FIXED: Moved AddressFields outside to prevent re-creation on every render
interface AddressFieldsProps {
  prefix: 'sender' | 'recipient';
  register: UseFormRegister<ShipmentFormData>;
  errors: FieldErrors<ShipmentFormData>;
  control: any;
  setValue: (name: any, value: any) => void;
  countryOptions: string[];
  cityOptionsByCountry: Record<string, string[]>;
}

const AddressFields = ({ prefix, register, errors, control, setValue, countryOptions, cityOptionsByCountry }: AddressFieldsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor={`${prefix}.name`}>Name</Label>
      <Input
        id={`${prefix}.name`}
        placeholder="Enter name"
        {...register(`${prefix}.name`, { required: 'Name is required' })}
        className={errors[prefix]?.name ? 'border-destructive' : ''}
      />
      {errors[prefix]?.name && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertTriangle size={14} />
          {errors[prefix]?.name?.message}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label htmlFor={`${prefix}.company`}>Company</Label>
      <Input id={`${prefix}.company`} placeholder="Enter company name (optional)" {...register(`${prefix}.company`)} />
    </div>
    <div className="space-y-2">
      <Label htmlFor={`${prefix}.email`}>Email</Label>
      <Input
        id={`${prefix}.email`}
        type="email"
        placeholder="example@email.com"
        {...register(`${prefix}.email`, {
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
        className={errors[prefix]?.email ? 'border-destructive' : ''}
      />
      {errors[prefix]?.email && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertTriangle size={14} />
          {errors[prefix]?.email?.message}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label htmlFor={`${prefix}.phone`}>Phone</Label>
      <Input id={`${prefix}.phone`} placeholder="Enter phone number" {...register(`${prefix}.phone`)} />
    </div>
    <div className="space-y-2">
      <Label htmlFor={`${prefix}.address1`}>Address Line 1</Label>
      <Input
        id={`${prefix}.address1`}
        placeholder="Enter street address"
        {...register(`${prefix}.address1`, { required: 'Address is required' })}
        className={errors[prefix]?.address1 ? 'border-destructive' : ''}
      />
      {errors[prefix]?.address1 && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertTriangle size={14} />
          {errors[prefix]?.address1?.message}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label htmlFor={`${prefix}.address2`}>Address Line 2</Label>
      <Input
        id={`${prefix}.address2`}
        placeholder="Apartment, suite, unit, etc. (optional)"
        {...register(`${prefix}.address2`)}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor={`${prefix}.country`}>Country</Label>
      <Controller
        control={control}
        name={`${prefix}.country` as any}
        rules={{ required: 'Country is required' }}
        render={({ field }) => (
          <Select
            value={field.value || ''}
            onValueChange={(val) => {
              field.onChange(val);
              setValue(`${prefix}.city`, '');
            }}
          >
            <SelectTrigger id={`${prefix}.country`} className={errors[prefix]?.country ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countryOptions.map((c) => (
                <SelectItem key={`${prefix}-country-${c}`} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors[prefix]?.country && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertTriangle size={14} />
          {errors[prefix]?.country?.message}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label htmlFor={`${prefix}.city`}>City</Label>
      <Controller
        control={control}
        name={`${prefix}.city` as any}
        rules={{ required: 'City is required' }}
        render={({ field }) => {
          const ctry = (control as any)._formValues?.[prefix]?.country || '';
          const cities = (ctry && cityOptionsByCountry[ctry]) ? cityOptionsByCountry[ctry] : [];
          return (
            <Select
              value={field.value || ''}
              onValueChange={(val) => field.onChange(val)}
            >
              <SelectTrigger id={`${prefix}.city`} className={errors[prefix]?.city ? 'border-destructive' : ''}>
                <SelectValue placeholder={ctry ? 'Select city' : 'Select country first'} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={`${prefix}-city-${city}`} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }}
      />
      {errors[prefix]?.city && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertTriangle size={14} />
          {errors[prefix]?.city?.message}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label htmlFor={`${prefix}.state`}>State/Province</Label>
      <Input id={`${prefix}.state`} placeholder="Enter state or province (optional)" {...register(`${prefix}.state`)} />
    </div>
    <div className="space-y-2">
      <Label htmlFor={`${prefix}.postalCode`}>Postal Code/Zip Code</Label>
      <Input
        id={`${prefix}.postalCode`}
        placeholder="Enter postal/zip code"
        {...register(`${prefix}.postalCode`, { required: 'Postal code/Zip code is required' })}
        className={errors[prefix]?.postalCode ? 'border-destructive' : ''}
      />
      {errors[prefix]?.postalCode && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertTriangle size={14} />
          {errors[prefix]?.postalCode?.message}
        </p>
      )}
    </div>
  </div>
);

const CreateShipmentPage = () => {
  const navigate = useNavigate();
  const { createNewShipment, isLoading, error: apiError, resetError } = useShipmentStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentType, setPaymentType] = useState<'prepaid' | 'collect' | 'account'>('prepaid');
  const [accountError, setAccountError] = useState<string | null>(null);
  const [manualAccountNumber, setManualAccountNumber] = useState<string>('');
  const [chargesCurrency, setChargesCurrency] = useState<Currency>('USD');
  const [createdAwb, setCreatedAwb] = useState<string | undefined>(undefined);

  // Auto-fill account number if user has one
  useEffect(() => {
    if (paymentType === 'account' && user?.businessAccountCode) {
      setManualAccountNumber(user.businessAccountCode);
    }
  }, [paymentType, user?.businessAccountCode]);

  // Clear API error on unmount
  useEffect(() => {
    return () => resetError();
  }, [resetError]);

  // Show API errors as toast
  useEffect(() => {
    if (apiError) {
      toast({
        title: `Error (${apiError.code})`,
        description: apiError.message,
        variant: 'destructive',
      });
    }
  }, [apiError, toast]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ShipmentFormData>({
    defaultValues: {
      sender: {
        name: '',
        company: '',
        email: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
      recipient: {
        name: '',
        company: '',
        email: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
      commodities: [
        {
          description: '',
          quantity: 1,
          weight: 0.1,
          value: 0,
          currency: 'USD',
          hsCode: '',
        },
      ],
      packageDetails: {
        length: 0,
        width: 0,
        height: 0,
        quantity: 1,
      },
      options: {
        insurance: false,
        signature: false,
        fragile: false,
        saturday: false,
      },
      serviceType: undefined,
      packageType: undefined,
      specialInstructions: '',
      chargesInformation: {
        amount: 0,
        currency: 'USD',
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'commodities',
  });

  const commodities = watch('commodities');
  const packageType = watch('packageType') as PackageType;
  const showDimensions = ['box', 'carton', 'tube', 'pallet'].includes(packageType || '');

  const [airports, setAirports] = useState<any[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const cityOptionsByCountry: Record<string, string[]> = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    airports.forEach((a) => {
      const cc = String((a as any).country || '').toUpperCase();
      const city = String((a as any).city || '').trim();
      if (!cc || !city) return;
      if (!map[cc]) map[cc] = [];
      map[cc].push(city);
    });
    Object.keys(map).forEach((k) => {
      map[k] = Array.from(new Set(map[k])).sort();
    });
    return map;
  }, [airports]);

  useEffect(() => {
    const loadAirports = async () => {
      try {
        const { apiRequestData } = await import('@/lib/api/client');
        const aps = await apiRequestData<any>({ method: 'GET', url: API_ENDPOINTS.shipments.airports });
        const rows = (aps as any).data || aps;
        setAirports(rows || []);
        const arr: any[] = Array.isArray(rows) ? (rows as any[]) : [];
        const uniq = Array.from(new Set(arr.map((r: any) => String(r.country || '').toUpperCase()).filter((v: string) => !!v))) as string[];
        setCountries(uniq.sort());
      } catch (e) {
        // silently ignore; selection will be empty
      }
    };
    loadAirports();
  }, []);

  // Auto-set package details when dimensions are required
  useEffect(() => {
    if (showDimensions) {
      setValue('packageDetails.quantity', 1);
      setValue('packageDetails.length', 0);
      setValue('packageDetails.width', 0);
      setValue('packageDetails.height', 0);
    }
  }, [packageType, setValue, showDimensions]);

  const totalWeight = commodities?.reduce((sum, item) => sum + (Number(item.weight) || 0), 0) || 0;
  const totalValue = commodities?.reduce((sum, item) => sum + (Number(item.value) || 0), 0) || 0;

  const validateShipmentData = (data: ShipmentFormData): string | null => {
    if (totalWeight <= 0) return 'Total weight must be greater than 0';
    if (totalValue <= 0) return 'Total value must be greater than 0';
    if (!data.sender?.email && !data.sender?.phone) return 'Either email or phone is required for sender';
    if (!data.recipient?.email && !data.recipient?.phone) return 'Either email or phone is required for recipient';
    return null;
  };

  const onSubmit = async (data: ShipmentFormData) => {
    const validationError = validateShipmentData(data);
    if (validationError) {
      toast({ title: 'Validation Error', description: validationError, variant: 'destructive' });
      return;
    }

    if (paymentType === 'account') {
      if (!manualAccountNumber) {
        setAccountError('Account number is required for account payments');
        return;
      }
      if (!/^\d{6}$/.test(manualAccountNumber)) {
        setAccountError('Account number must be exactly 6 digits');
        return;
      }
      if (!user?.businessAccountCode) {
        setAccountError('Your account does not have permission to use account payments');
        return;
      }
      if (user.businessAccountCode !== manualAccountNumber) {
        setAccountError('Invalid account number');
        return;
      }
    }

    setAccountError(null);

    const shipment = await createNewShipment({
      ...data,
      paymentType,
      accountNumber: paymentType === 'account' ? manualAccountNumber : undefined,
      chargesInformation: {
        amount: Number(data.chargesInformation?.amount || 0),
        currency: chargesCurrency,
      },
      totalWeight,
      totalValue,
      totalCurrency: data.commodities[0]?.currency || 'USD',
    });

    if (shipment) {
      setCreatedAwb(shipment.awbNumber);
      try {
        const { generateAwbPdf } = await import('@/shared/utils/generateAwb');
        const awbNumberForPdf = shipment.awbNumber;
        if (!awbNumberForPdf) {
          toast({ title: 'Missing AWB Number', description: 'Shipment created without AWB. Please retry AWB generation.', variant: 'destructive' });
          return;
        }
        const awbPdfBlob = await generateAwbPdf({
          shipment,
          awbNumber: awbNumberForPdf,
          logo: '/logo.png',
        });

        const { generateInvoicePDF } = await import('@/shared/utils/generateInvoice');
        const shipmentCharge = Number(data.chargesInformation?.amount || 0);
        const invoicePdfBlob = await generateInvoicePDF({
          invoiceNumber: `INV-${awbNumberForPdf.replace('DRAFT-', '')}`,
          date: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          companyInfo: {
            name: 'WORIYA EXPRESS',
            address: '123 Logistics Way, Shipping City, SC 12345',
            phone: '+1 (800) 123-4567',
            email: 'info@woriyaexpress.com',
            website: 'www.woriyaexpress.com',
            vatNumber: 'VAT123456789',
          },
          customerInfo: {
            name: data.sender.name || '',
            contactPerson: data.sender.company || '',
            address: data.sender.address1 || '',
            city: data.sender.city || '',
            postalCode: data.sender.postalCode || '',
            country: data.sender.country || '',
            accountNumber: paymentType === 'account' ? manualAccountNumber : undefined,
            email: data.sender.email || '',
            phone: data.sender.phone || '',
          },
          shipToInfo: {
            name: data.recipient.name || '',
            contactPerson: data.recipient.company || '',
            address: data.recipient.address1 || '',
            city: data.recipient.city || '',
            postalCode: data.recipient.postalCode || '',
            country: data.recipient.country || '',
            email: data.recipient.email || '',
            phone: data.recipient.phone || '',
          },
          awbReferences: [
            {
              awbNumber: awbNumberForPdf,
              description: 'Shipment charges',
              amount: totalValue,
              issueDate: new Date().toISOString(),
              originCity: data.sender.city || '',
              destinationCity: data.recipient.city || '',
              goodsDescription: data.commodities.map((c) => c.description).join(', '),
              valueETB: shipment.chargesInformation?.amount || 0,
            },
          ],
          items: data.commodities.map((item, index) => ({
            itemNo: index + 1,
            description: item.description,
            quantity: Number(item.quantity),
            unit: 'Pcs',
            unitPrice: Number(item.quantity) ? Number(item.value) / Number(item.quantity) : 0,
            amount: Number(item.value) || 0,
            currency: item.currency,
          })),
          subtotal: shipment.chargesInformation?.amount || 0,
          vatPercentage: 15,
          vatAmount: shipment.chargesInformation?.amount || 0 * 15 / 100,
          total: (shipment.chargesInformation?.amount || 0) * 1.15,
          paymentInfo: {
            method: paymentType === 'account' ? 'Account' : paymentType === 'prepaid' ? 'Prepaid' : 'Collect',
            bankName: 'Commercial Bank of Ethiopia',
            accountName: 'WORIYA EXPRESS',
            accountNumber: '1000123456789',
            swiftCode: 'CBETETAA',
          },
          termsAndConditions: [
            'Payment is due within 30 days from the invoice date',
            'Late payment may incur a penalty of 2% per month',
            'All prices are in Ethiopian Birr (ETB)',
            'This invoice is subject to our standard terms and conditions',
          ],
        });

        const awbPdfUrl = URL.createObjectURL(awbPdfBlob);
        const invoicePdfUrl = URL.createObjectURL(invoicePdfBlob);

        let awbDidOpen = false;
        let invoiceDidOpen = false;

        try {
          const awbWindow = window.open(awbPdfUrl, '_blank');
          if (awbWindow && !awbWindow.closed) awbDidOpen = true;
          const invoiceWindow = window.open(invoicePdfUrl, '_blank');
          if (invoiceWindow && !invoiceWindow.closed) invoiceDidOpen = true;
        } catch (e) {
          console.error('Error opening PDF windows:', e);
        }

        if (!awbDidOpen) {
          const a = document.createElement('a');
          a.href = awbPdfUrl;
          a.download = `AWB-${awbNumberForPdf}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        if (!invoiceDidOpen) {
          const a = document.createElement('a');
          a.href = invoicePdfUrl;
          a.download = `Invoice-${awbNumberForPdf}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        setTimeout(() => {
          URL.revokeObjectURL(awbPdfUrl);
          URL.revokeObjectURL(invoicePdfUrl);
          navigate('/dashboard/shipments');
        }, 1000);
      } catch (error) {
        console.error('Error generating PDFs:', error);
        navigate('/dashboard/shipments');
      }
    }
  };

  const notApproved = user && user.isApproved === false;
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="h-7 w-7 text-primary" />
            Create New Shipment
          </h1>
          <p className="text-gray-600 mt-2">Fill in the details below to create a new shipment.</p>
          {notApproved && (
            <div className="mt-4 bg-yellow-100 border border-yellow-200 text-yellow-900 p-4 rounded-md">
              Your account is pending admin approval. High-risk actions like creating shipments and account payments are disabled.
            </div>
          )}
          {createdAwb && (
            <div className="mt-4">
              <AWBStatusBadge awbNumber={createdAwb} />
            </div>
          )}
        </div>

        {(apiError || accountError) && (
          <div className="mb-6 bg-destructive/10 border border-destructive text-destructive p-4 rounded-md flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{(apiError && apiError.message) || accountError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Payment Info */}
          <section className="bg-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Payment Information
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="paymentType">Payment Type</Label>
                <Select
                  value={paymentType}
                  onValueChange={(value) => {
                    setPaymentType(value as 'prepaid' | 'collect' | 'account');
                    setAccountError(null);
                    setManualAccountNumber('');
                  }}
                >
                  <SelectTrigger id="paymentType" className="w-full">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prepaid">Prepaid</SelectItem>
                    <SelectItem value="collect">Collect</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentType === 'account' && (
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={manualAccountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setManualAccountNumber(value);
                      setAccountError(null);
                    }}
                    placeholder="Enter 6-digit account number"
                    className={accountError ? 'border-destructive' : ''}
                  />
                  {accountError ? (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertTriangle size={14} />
                      {accountError}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Please enter your 6-digit account number</p>
                  )}
                </div>
              )}

              <div className="border-t pt-5">
                <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Charges Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chargesAmount">Amount</Label>
                    <Input
                      id="chargesAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('chargesInformation.amount', {
                        min: { value: 0, message: 'Amount must be 0 or greater' },
                      })}
                      className={errors.chargesInformation?.amount ? 'border-destructive' : ''}
                    />
                    {errors.chargesInformation?.amount && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {errors.chargesInformation.amount.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chargesCurrency">Currency</Label>
                    <Select value={chargesCurrency} onValueChange={(value) => setChargesCurrency(value as Currency)}>
                      <SelectTrigger id="chargesCurrency" className="w-full">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((curr) => (
                          <SelectItem key={curr} value={curr}>
                            {curr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sender & Recipient */}
          <section className="bg-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Sender Information
            </h2>
            <AddressFields 
              prefix="sender" 
              register={register} 
              errors={errors} 
              control={control}
              setValue={setValue}
              countryOptions={countries}
              cityOptionsByCountry={cityOptionsByCountry}
            />
          </section>

          <section className="bg-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Recipient Information
            </h2>
            <AddressFields 
              prefix="recipient" 
              register={register} 
              errors={errors} 
              control={control}
              setValue={setValue}
              countryOptions={countries}
              cityOptionsByCountry={cityOptionsByCountry}
            />
          </section>

          {/* Shipment Details */}
          <section className="bg-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Shipment Details
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select
                      value={watch('serviceType')}
                      onValueChange={(value) => setValue('serviceType', value as ServiceType, { shouldValidate: true })}
                    >
                      <SelectTrigger id="serviceType" className={errors.serviceType ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="express-domestic">Express: Domestic</SelectItem>
                        <SelectItem value="express-worldwide">Express: Worldwide</SelectItem>
                        <SelectItem value="priority">Priority (2-3 Business Days)</SelectItem>
                        <SelectItem value="standard">Standard (3-5 Business Days)</SelectItem>
                        <SelectItem value="economy">Economy (5-7 Business Days)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.serviceType && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {errors.serviceType.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="packageType">Package Type</Label>
                    <Select
                      value={watch('packageType')}
                      onValueChange={(value) => {
                        setValue('packageType', value as PackageType, { shouldValidate: true });
                      }}
                    >
                      <SelectTrigger id="packageType" className={errors.packageType ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select package type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="envelope">Envelope (No dimensions needed)</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="carton">Carton</SelectItem>
                        <SelectItem value="tube">Tube</SelectItem>
                        <SelectItem value="pallet">Pallet</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.packageType && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {errors.packageType.message}
                      </p>
                    )}
                  </div>
                </div>

                {showDimensions && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="packageQuantity">Package Quantity</Label>
                      <Input
                        id="packageQuantity"
                        type="number"
                        min="1"
                        placeholder="1"
                        {...register('packageDetails.quantity', {
                          required: 'Quantity is required',
                          min: { value: 1, message: 'Quantity must be at least 1' },
                        })}
                        className={errors.packageDetails?.quantity ? 'border-destructive' : ''}
                      />
                      {errors.packageDetails?.quantity && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertTriangle size={14} />
                          {errors.packageDetails.quantity.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Package Dimensions (cm)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Length"
                            {...register('packageDetails.length', {
                              required: 'Length is required',
                              min: { value: 0.1, message: 'Length must be greater than 0' },
                            })}
                            className={errors.packageDetails?.length ? 'border-destructive' : ''}
                          />
                          {errors.packageDetails?.length && (
                            <p className="text-xs text-destructive mt-1">{errors.packageDetails.length.message}</p>
                          )}
                        </div>
                        <div>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Width"
                            {...register('packageDetails.width', {
                              required: 'Width is required',
                              min: { value: 0.1, message: 'Width must be greater than 0' },
                            })}
                            className={errors.packageDetails?.width ? 'border-destructive' : ''}
                          />
                          {errors.packageDetails?.width && (
                            <p className="text-xs text-destructive mt-1">{errors.packageDetails.width.message}</p>
                          )}
                        </div>
                        <div>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Height"
                            {...register('packageDetails.height', {
                              required: 'Height is required',
                              min: { value: 0.1, message: 'Height must be greater than 0' },
                            })}
                            className={errors.packageDetails?.height ? 'border-destructive' : ''}
                          />
                          {errors.packageDetails?.height && (
                            <p className="text-xs text-destructive mt-1">{errors.packageDetails.height.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Shipping Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="insurance" {...register('options.insurance')} />
                      <Label htmlFor="insurance">Insurance Coverage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="signature" {...register('options.signature')} />
                      <Label htmlFor="signature">Signature Required</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="fragile" {...register('options.fragile')} />
                      <Label htmlFor="fragile">Fragile Handling</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="saturday" {...register('options.saturday')} />
                      <Label htmlFor="saturday">Saturday Delivery</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    {...register('specialInstructions')}
                    placeholder="Any specific handling instructions or delivery notes"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Commodities */}
          <section className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Box className="h-5 w-5 text-primary" />
                Commodity Details
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    description: '',
                    quantity: 1,
                    weight: 0.1,
                    value: 0,
                    currency: 'USD',
                    hsCode: '',
                  })
                }
                className="flex items-center gap-1"
              >
                <Plus size={16} /> Add Item
              </Button>
            </div>
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="relative border rounded-lg p-5 pt-10 bg-card/50">
                  <div className="absolute top-3 right-3 flex items-center">
                    <button
                      type="button"
                      className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                      onClick={() => fields.length > 1 && remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`commodities.${index}.description`}>Description</Label>
                      <Input
                        id={`commodities.${index}.description`}
                        placeholder="Item description"
                        {...register(`commodities.${index}.description` as const, {
                          required: 'Description is required',
                        })}
                        className={errors.commodities?.[index]?.description ? 'border-destructive' : ''}
                      />
                      {errors.commodities?.[index]?.description && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertTriangle size={14} />
                          {errors.commodities[index].description?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`commodities.${index}.hsCode`}>HS Code (Optional)</Label>
                      <Input
                        id={`commodities.${index}.hsCode`}
                        placeholder="Enter HS code"
                        {...register(`commodities.${index}.hsCode` as const)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`commodities.${index}.quantity`}>Quantity</Label>
                      <Input
                        id={`commodities.${index}.quantity`}
                        type="number"
                        min="1"
                        placeholder="1"
                        {...register(`commodities.${index}.quantity` as const, {
                          required: 'Quantity is required',
                          min: { value: 1, message: 'Quantity must be at least 1' },
                        })}
                        className={errors.commodities?.[index]?.quantity ? 'border-destructive' : ''}
                      />
                      {errors.commodities?.[index]?.quantity && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertTriangle size={14} />
                          {errors.commodities[index].quantity?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`commodities.${index}.weight`}>Weight (kg)</Label>
                      <Input
                        id={`commodities.${index}.weight`}
                        type="number"
                        step="0.01"
                        placeholder="0.1"
                        {...register(`commodities.${index}.weight` as const, {
                          required: 'Weight is required',
                          min: { value: 0.01, message: 'Weight must be greater than 0' },
                        })}
                        className={errors.commodities?.[index]?.weight ? 'border-destructive' : ''}
                      />
                      {errors.commodities?.[index]?.weight && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertTriangle size={14} />
                          {errors.commodities[index].weight?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`commodities.${index}.value`}>Value</Label>
                      <Input
                        id={`commodities.${index}.value`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register(`commodities.${index}.value` as const, {
                          required: 'Value is required',
                          min: { value: 0, message: 'Value must be 0 or greater' },
                        })}
                        className={errors.commodities?.[index]?.value ? 'border-destructive' : ''}
                      />
                      {errors.commodities?.[index]?.value && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertTriangle size={14} />
                          {errors.commodities[index].value?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`commodities.${index}.currency`}>Currency</Label>
                      <Controller
                        name={`commodities.${index}.currency` as const}
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id={`commodities.${index}.currency`}>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {CURRENCIES.map((curr) => (
                                <SelectItem key={`${index}-${curr}`} value={curr}>
                                  {curr}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 mt-6">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">Total Weight:</span>
                    <span className="font-semibold">{totalWeight.toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">Total Value:</span>
                    <span className="font-semibold">
                      {totalValue.toFixed(2)} {commodities[0]?.currency || 'USD'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => {
                handleSubmit(async (formData) => {
                  if (paymentType === 'account' && (!manualAccountNumber || !/^\d{6}$/.test(manualAccountNumber))) {
                    setAccountError('Account number must be exactly 6 digits');
                    return;
                  }
                  try {
                    const { generateAwbPdf } = await import('@/shared/utils/generateAwb');
                    const draftAwbNumber = `DRAFT-${Date.now()}`;
                    const awbPdfBlob = await generateAwbPdf({
                      shipment: {
                        id: draftAwbNumber,
                        awbNumber: draftAwbNumber,
                        createdAt: new Date().toISOString(),
                        ...formData,
                        paymentType,
                        accountNumber: paymentType === 'account' ? manualAccountNumber : undefined,
                        chargesInformation: {
                          amount: Number(formData.chargesInformation?.amount || 0),
                          currency: chargesCurrency,
                        },
                        totalWeight,
                        totalValue,
                        totalCurrency: formData.commodities[0]?.currency || 'USD',
                      },
                      awbNumber: draftAwbNumber,
                      logo: '/logo.png',
                    });
                    const previewUrl = URL.createObjectURL(awbPdfBlob);
                    let didOpen = false;
                    try {
                      const previewWindow = window.open(previewUrl, '_blank');
                      if (previewWindow) didOpen = true;
                    } catch (e) {
                      console.error('Preview window blocked', e);
                    }
                    if (!didOpen) {
                      const a = document.createElement('a');
                      a.href = previewUrl;
                      a.download = `AWB-${draftAwbNumber}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }
                    setTimeout(() => URL.revokeObjectURL(previewUrl), 2000);
                  } catch (error) {
                    console.error('Error generating AWB PDF:', error);
                    toast({
                      title: 'PDF Generation Failed',
                      description: 'Could not generate preview. Please try again.',
                      variant: 'destructive',
                    });
                  }
                })();
              }}
            >
              Preview AWB PDF (Draft)
            </Button>
            <Button type="submit" className="w-full md:w-auto" disabled={isLoading || !!notApproved}>
              {isLoading ? 'Creating Shipment...' : 'Create Shipment'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateShipmentPage;
