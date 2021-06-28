export interface Exercise {
    id: string;
    name: string;
    duration: number; //seconds
    calories: number; //Joules
    date?: Date; 
    state?: 'completed' | 'cancelled' | null;
}