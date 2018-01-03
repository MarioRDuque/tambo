import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { Paginacion } from '../../entidades/entidad.paginacion';
import { ToastrService } from 'ngx-toastr';

import { ApiRequestService } from '../../servicios/api-request.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  public page: number = 1;
  public paginacion:Paginacion;
  public solicitando = false;
  public vistaFormulario = false;
  public parametros: any = {};
  public solicitudExitosa = false;
  public mensajeForUser = '';
  public idProducto = '';
  public producto:any = {
    //"idunidad":{}
  };
  public productos : any = [];
  public unidades:any = [];
  public file:any = [];

  constructor(public activeModal: NgbActiveModal,
              private apiRequest: ApiRequestService,
              private toastr: ToastrService) {
    this.paginacion = new Paginacion();
  }

  ngOnInit() {
    this.traerProductos();
    this.traerUnidadesDeMedida();
  }

  busqueda(): void {
    this.page = 1;
    this.parametros = {
      "docCliente":this.idProducto
    };
    this.traerProductos();
  }

  traerProductos(parametros:any=this.parametros): any {
    this.solicitando = true;
    return this.apiRequest.post('producto/pagina/'+this.page+'/cantidadPorPagina/'+this.paginacion.cantidadPorPagina, parametros)
      .then(
        data => {
          if(data){
            this.solicitando = false;
            this.solicitudExitosa = true;
            this.paginacion.totalRegistros = data.totalRegistros;
            this.paginacion.paginaActual = data.paginaActual;
            this.paginacion.totalPaginas = data.totalPaginas;
            this.productos = data.registros;
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  traerUnidadesDeMedida(): any {
    this.solicitando = true;
    return this.apiRequest.get('unidad')
      .then(
        data => {
          if(data && data.extraInfo){
            this.solicitando = false;
            this.solicitudExitosa = true;
            this.unidades = data.extraInfo;
          }
          else {
            this.toastr.info(data.operacionMensaje,"Informacion");
            this.solicitando = false;
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  onSubmit():any{
    this.solicitando = true;
    var formData = new FormData();
    formData.append("file", this.file);
    formData.append("producto", this.producto);
    return this.apiRequest.post('producto', this.producto)
      .then(
        data => {
          if(data && data.extraInfo){
            this.solicitando = false;
            this.solicitudExitosa = true;
            this.productos.push(data.extraInfo);
            this.vistaFormulario = false;
          }
          else{
            this.toastr.info(data.operacionMensaje,"Informacion");
            this.solicitando = false;
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  private handleError(error: any): void {
    this.toastr.error("Error interno.","Error");
    this.solicitando = false;
    this.solicitudExitosa = false;
    this.mensajeForUser = 'Ups Error';
  }

}
