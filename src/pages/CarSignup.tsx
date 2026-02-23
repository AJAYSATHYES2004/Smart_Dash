import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Shield, User, Key, FileText, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const carSignupSchema = z.object({
    car_id: z.string().min(3, 'Car ID must be at least 3 characters'),
    number_plate: z.string().min(5, 'Number Plate must be at least 5 characters'),
    secret_code: z.string().min(4, 'Secret Code must be at least 4 characters'),
    engine_number: z.string().min(5, 'Engine Number is required'),
    owner_name: z.string().min(2, 'Owner Name is required'),
    owner_contact: z.string().min(10, 'Valid contact number is required'),
    initial_petrol: z.coerce.number().min(0).max(100),
    initial_oil: z.coerce.number().min(0).max(100),
});

const CarSignup = () => {
    const { registerCar } = useAuth();
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof carSignupSchema>>({
        resolver: zodResolver(carSignupSchema),
        defaultValues: {
            car_id: '',
            number_plate: '',
            secret_code: '',
            engine_number: '',
            owner_name: '',
            owner_contact: '',
            initial_petrol: 50,
            initial_oil: 50,
        },
    });

    const [rcBookImage, setRcBookImage] = React.useState<string | null>(null);

    const handleRCUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setRcBookImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (values: z.infer<typeof carSignupSchema>) => {
        try {
            // Massage data to match backend schema
            // Backend expects { car: {...}, owner: {...}, insurance: {...}, rc_book: {...} }
            const carData = {
                car: {
                    car_id: values.car_id,
                    number_plate: values.number_plate,
                    secret_code: values.secret_code,
                    engine_number: values.engine_number,
                },
                owner: {
                    name: values.owner_name,
                    contact: values.owner_contact,
                },
                // Initial driving data isn't handled by register endpoint yet, considering adding it separately or ignoring for now
                // driving_data: { ... } 

                rc_book: rcBookImage ? {
                    image: rcBookImage,
                    registrationDate: new Date()
                } : undefined
            };

            const success = await registerCar(carData);
            if (success) {
                toast.success('Car registered successfully!');
                navigate('/login'); // Redirect to user login, or back to car login
            } else {
                toast.error('Registration failed. Car ID or Number Plate might already exist.');
            }
        } catch (error) {
            toast.error('An error occurred during registration.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />

            <div className="w-full max-w-2xl z-10 relative">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-primary/20 rounded-full overflow-hidden flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-primary/30 shadow-[0_0_30px_rgba(0,255,157,0.3)]">
                        <img src="/logo.png" alt="Smart Dash Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-foreground tracking-tight mb-2">
                        Register Vehicle
                    </h1>
                    <p className="text-muted-foreground">
                        Create a new digital identity for your car
                    </p>
                </div>

                <Card className="glass-panel border-primary/20 shadow-2xl backdrop-blur-xl bg-background/60">
                    <CardHeader>
                        <CardTitle>Vehicle Details</CardTitle>
                        <CardDescription>Enter the details to register your car in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Identity Section */}
                                    <FormField
                                        control={form.control}
                                        name="car_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Car ID (Unique)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Car className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="CAR-001" className="pl-9 bg-background/50" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="number_plate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Number Plate</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="KA-01-AB-1234" className="pl-9 bg-background/50" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="secret_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Secret Code</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input type="password" placeholder="••••" className="pl-9 bg-background/50" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="engine_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Engine Number</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Activity className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="ENG-12345" className="pl-9 bg-background/50" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="border-t border-border/50 my-4 pt-4">
                                    <h3 className="text-sm font-medium mb-4 text-muted-foreground">Owner Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="owner_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Owner Name</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input placeholder="John Doe" className="pl-9 bg-background/50" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="owner_contact"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Owner Contact</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input placeholder="+91 9876543210" className="pl-9 bg-background/50" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-border/50 my-4 pt-4">
                                    <h3 className="text-sm font-medium mb-4 text-muted-foreground">Documents</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <Label className="text-foreground text-sm mb-2 block">RC Book Image (Optional)</Label>
                                                <div className="flex items-center gap-4">
                                                    <label className="cursor-pointer bg-secondary px-4 py-2 rounded-md border border-border hover:border-primary transition-colors flex items-center gap-2 text-sm text-foreground">
                                                        <FileText className="w-4 h-4" />
                                                        Upload RC Book
                                                        <input type="file" accept="image/*" onChange={handleRCUpload} className="hidden" />
                                                    </label>
                                                    {rcBookImage && (
                                                        <span className="text-primary text-xs flex items-center gap-1">
                                                            ✓ Uploaded
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {rcBookImage && (
                                                <div className="w-16 h-16 rounded-md overflow-hidden border border-border">
                                                    <img src={rcBookImage} alt="RC Book Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border/50 my-4 pt-4">
                                    <h3 className="text-sm font-medium mb-4 text-muted-foreground">Initial Diagnostics</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="initial_petrol"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Fuel Level (%)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="bg-background/50" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="initial_oil"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Oil Level (%)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="bg-background/50" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90">
                                    Register Vehicle
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="justify-center border-t border-border/50 pt-4">
                        <Link to="/car-login" className="text-sm text-primary hover:underline">
                            Already registered? Connect here
                        </Link>
                    </CardFooter>
                </Card>
            </div >
        </div >
    );
};

export default CarSignup;
