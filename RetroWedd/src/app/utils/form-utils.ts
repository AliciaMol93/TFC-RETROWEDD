import { FormGroup } from "@angular/forms";

export class FormUtils {
  static isValidField(form: FormGroup, fieldName:string) : boolean | null{
    return!! form.controls[fieldName].errors && form.controls[fieldName].touched;
  }

  static getFieldError(form:FormGroup, fieldName: string): string | null {
    if (!form.controls[fieldName]) return null;

    const errors = form.controls[fieldName].errors ?? {};
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es obligatorio';
        case 'pattern':
          return 'Solo se permiten letras y espacios';
          case 'min':
            return 'Has puesto un número incorrecto'
          case 'max':
            return 'El número máximo de niños es 3'
        case 'email':
          return 'Correo electrónico inválido';
      }
    }

    return null;
  }
}
