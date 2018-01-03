import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { ApiRequestService } from '../servicios/api-request.service';
import 'rxjs/add/operator/toPromise';

export interface MenuParams {
    usuario: string;
}
@Injectable()
export class HomeService {
   almacenamiento: Storage = sessionStorage; 
   menuStorage: string = "menus";

  constructor(
  	private router: Router,
    private apiRequest: ApiRequestService
    ) { }

  getMenu(usuario:string): Promise<any> {
  		let bodyData: MenuParams = {
          "usuario": usuario
        }
        return this.apiRequest.post('menu/obtener',bodyData)
          .then(
            jsonResp => {
              if (jsonResp.extraInfo) {
                this.almacenamiento.setItem(this.menuStorage, JSON.stringify(jsonResp.extraInfo));
              }
              return jsonResp;
            }
          )
          .catch(err => this.handleError(err));
    }

    private handleError(error: any): Promise<any> {
      return Promise.reject(error.message || error);
    }

}
