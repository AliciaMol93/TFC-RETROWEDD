import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Invitado } from '../components/rsvp/rsvp-form/invitadoInterface';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environment/environment';

const CLAVE_SECRETA = 'retrowedd123';

@Injectable({
  providedIn: 'root',
})
export class RsvpService {
  private apiUrl = environment.apiUrl;
  private suggestionUrl = environment.suggestionUrl;

  constructor(private http: HttpClient) {}

  //confirmacion asistencia
  readonly #asistenciaSubject = new BehaviorSubject<boolean>(false);
  readonly asistencia$ = this.#asistenciaSubject.asObservable();

  // Método para obtener los menús
  getMenus(): Observable<any> {
    return this.http.get(`${this.apiUrl}?action=getMenus`);
  }

  // Método para obtener los alérgenos
  getAlergenos(): Observable<any> {
    return this.http.get(`${this.apiUrl}?action=getAlergenos`);
  }

  //obtener el email descifrado
  getEmailDescifrado(): string | null {
    const emailCifrado = localStorage.getItem('email');
    if (emailCifrado) {
      const bytes = CryptoJS.AES.decrypt(emailCifrado, CLAVE_SECRETA);
      return bytes.toString(CryptoJS.enc.Utf8);
    }
    return null;
  }

  guardarEmailCifrado(email: string): void {
    const emailCifrado = CryptoJS.AES.encrypt(email, CLAVE_SECRETA).toString();
    localStorage.setItem('email', emailCifrado);
  }

  // Método para crear un nuevo invitado
  crearInvitado(invitado: Invitado): Observable<number> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (invitado.asistencia) {
      this.#asistenciaSubject.next(true);
    }

    return this.http.post<any>(this.apiUrl, { invitado }, { headers }).pipe(
      map((response) => {
        // Verificamos si la respuesta contiene el invitadoId
        if (response.success && response.invitadoId) {
          console.log('ID recibido del backend:', response.invitadoId);
          // Guardamos el invitadoId en localStorage
          localStorage.setItem('invitado_id', response.invitadoId.toString());
          return response.invitadoId; // Devolvemos el invitadoId
        } else {
          throw new Error('No se recibió el ID del invitado');
        }
      })
    );
  }

  //metodo para saber si el invitado ha confirmado la asistencia
  getAsistenciaStatus(email: string): Observable<boolean> {
    return this.http
      .get<{ asistencia: boolean }>(
        `${this.apiUrl}?action=getAsistencia&email=${email}`
      )
      .pipe(
        map((response) => {
          this.#asistenciaSubject.next(response.asistencia);
          return response.asistencia;
        }) // Extraemos solo el valor de asistencia
      );
  }

  // Método para guardar una sugerencia
  saveSuggestion(suggestion: any): Observable<any> {
    console.log('Enviando sugerencia con payload:', suggestion);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(
      `${this.suggestionUrl}?action=addSongSuggestion`,
      suggestion,
      { headers }
    );
  }
}
