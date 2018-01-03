import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { ApiRequestService } from '../servicios/api-request.service';
import 'rxjs/add/operator/toPromise';
import { ToastrService } from 'ngx-toastr';

export interface MenuParams {
    usuario: string;
}
@Injectable()
export class HomeService {
   almacenamiento: Storage = sessionStorage;
   menuStorage: string = "menus";

  constructor(
  	private router: Router,
    private apiRequest: ApiRequestService,
    public toastr: ToastrService
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

  guardarTiposEnStorage(){
    this.guardarTipoDocumento();
    this.traerUbigeos('distrito',null);
    this.traerUbigeos('centro',1);
    this.guardarUnidadesDeMedida();
  }

  guardarTipoDocumento(){
    this.apiRequest.post('tipodocumento/pagina/'+1+'/cantidadPorPagina/'+10, {})
      .then(
        data => {
          if(data && data.registros){
            localStorage.setItem("tiposDocumento", JSON.stringify(data.registros));
          } else {
            this.toastr.info("No se obtuvieron tipos de documento", "Info");
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  traerUbigeos(nombre, padre) {
    this.apiRequest.post('ubigeo/listar', {padre:padre})
      .then(
        data => {
          if(data && data.extraInfo){
            switch (nombre) {
              case 'distrito':
                localStorage.setItem("distritos", JSON.stringify(data.extraInfo));
                break;
              case 'centro':
                localStorage.setItem("centros", JSON.stringify(data.extraInfo));
                break;
            }
          } else{
            this.toastr.info(data.operacionMensaje,"Informacion");
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  guardarUnidadesDeMedida(){
    this.apiRequest.get('unidad')
      .then(
        data => {
          if(data && data.extraInfo){
            localStorage.setItem("unidades", JSON.stringify(data.extraInfo));
          } else {
            this.toastr.info(data.operacionMensaje,"Informacion");
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
