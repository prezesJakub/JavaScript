export interface Ocena {
    przedmiot: string;
    ocena: number;
}

export interface Student {
    id: string;
    imie: string;
    nazwisko: string;
    zdjecie: string;
    oceny: Ocena[];
}