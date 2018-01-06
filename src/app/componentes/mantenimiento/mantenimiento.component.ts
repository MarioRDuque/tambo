import { Component, OnInit } from '@angular/core';
import {ClienteComponent} from '../cliente/cliente.component';
import { NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbTabChangeEvent} from '@ng-bootstrap/ng-bootstrap';
import { Paginacion } from '../../entidades/entidad.paginacion';
import { ToastrService } from 'ngx-toastr';
import{ ModalConfirmacionComponent } from './../../componentes/modal-confirmacion.component';
import { ApiRequestService } from '../../servicios/api-request.service';

@Component({
  selector: 'app-mantenimiento',
  templateUrl: './mantenimiento.component.html',
  styleUrls: ['./mantenimiento.component.css']
})
export class MantenimientoComponent implements OnInit {

  currentJustify = 'start';
  public page: number = 1;
  public paginacion:Paginacion;
  public solicitando = false;
  public vistaFormulario = false;
  public solicitudExitosa = false;
  public parametros: any = {};
  public usuarios: any = [];
  public monedas: any = [];
  public documentos: any = [];
  public unidades: any = [];
  public numdoc:"";
  public nomusu:"";
  public abrev:"";
  public usuario: any = {
    "tipousuario":""
  };
  public tipodocumento: any = {};
  public moneda: any = {};
  public unidad: any = {};
  public tiposUsuario = [];
  public clavesIguales = false;

  constructor(private apiRequest: ApiRequestService,
              private toastr: ToastrService,
              private modalService: NgbModal) {
    this.paginacion = new Paginacion();
  }

  public changeTab($event: NgbTabChangeEvent) {
    this.vistaFormulario = false;
    this.abrev = "";
    this.parametros = {};
    switch ($event.nextId) {
      case 'usuario':
        this.traer($event.nextId);
        break;
      case 'tipodocumento':
        this.traer($event.nextId);
        break;
      case 'unidad':
        this.traer($event.nextId);
        break;
      case 'moneda':
        this.traer($event.nextId);
        break;
    }
  };

  ngOnInit() {
    this.traer('usuario');
    this.traer('tipousuario');
  }

  busqueda(ruta): void {
    this.page = 1;
    this.parametros = {
      "dni":this.numdoc,
      "abr":this.abrev,
      "nomusu":this.nomusu
    };
    this.traer(ruta);
  }

  public compararClaves(){
    if(this.usuario.password == this.usuario.clave1){
      this.clavesIguales = true;
    }
    else {
      this.clavesIguales = false;
    }
  }

  traer(ruta): any {
    this.solicitando = true;
    return this.apiRequest.post(ruta+'/pagina/'+this.page+'/cantidadPorPagina/'+this.paginacion.cantidadPorPagina, this.parametros)
      .then(
        data => {
          if(data){
            this.solicitando = false;
            this.solicitudExitosa = true;
            this.paginacion.totalRegistros = data.totalRegistros;
            this.paginacion.paginaActual = data.paginaActual;
            this.paginacion.totalPaginas = data.totalPaginas;
            switch (ruta) {
              case 'usuario':
                this.usuarios = data.registros;
                break;
              case 'tipodocumento':
                this.documentos = data.registros;
                break;
              case 'unidad':
                this.unidades = data.registros;
                break;
              case 'moneda':
                this.monedas = data.registros;
                break;
              case 'tipousuario':
                this.tiposUsuario = data.registros;
                break;
            }
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  onSubmit(ruta,objeto):any{

    this.solicitando = true;
    if(objeto.id){
        return this.apiRequest.put(ruta, objeto)
          .then(
            data => {
              if(data && data.extraInfo){
                this.solicitando = false;
                this.solicitudExitosa = true;
                this.vistaFormulario = false;
                switch (ruta){
                  case 'unidad':
                  this.unidad = data.extraInfo;
                  let unidad = this.unidades.find(item => item.id === this.unidad.id);
                  let index = this.unidades.indexOf(unidad);
                  this.unidades[index] = this.unidad;
                  break;
                }
              } else {
                this.toastr.info(data.operacionMensaje,"Informacion");
                this.solicitando = false;
              }
            }
          )
          .catch(err => this.handleError(err));
    } else {
      return this.apiRequest.post(ruta, objeto)
        .then(
          data => {
            if(data && data.extraInfo){
              this.solicitando = false;
              this.solicitudExitosa = true;
              switch (ruta) {
                case 'usuario':
                  this.usuarios.push(data.extraInfo);
                  this.usuario = {
                    "tipousuario":""
                  };
                  break;
                case 'tipodocumento':
                  this.documentos.push(data.extraInfo);
                  this.tipodocumento = {};
                  break;
                case 'unidad':
                  this.unidades.push(data.extraInfo);
                  this.unidad = {};
                  break;
                case 'moneda':
                  this.monedas.push(data.extraInfo);
                  this.moneda = {};
                  break;
              }
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
  }

  traerParaEdicion(id, ruta){
    this.solicitando = true;
    this.vistaFormulario = true;
    return this.apiRequest.post(ruta+'/obtener', {id:id})
      .then(
        data => {
          if(data && data.extraInfo){
            this.solicitando = false;
            switch (ruta){
              case 'unidad':
                this.unidad = data.extraInfo;
                break;
            }
          } else {
            this.toastr.info(data.operacionMensaje,"Informacion");
            this.vistaFormulario = false;
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  confirmarEliminacion(objeto, ruta):void{
    const modalRef = this.modalService.open(ModalConfirmacionComponent);
    modalRef.result.then((result) => {
      this.eliminar(objeto, ruta);
    }, (reason) => {
    });
  }

  eliminar(obj, ruta){
    this.solicitando = true;
    return this.apiRequest.post(ruta+'/eliminar', {id:obj.id})
      .then(
        data => {
          if(data && data.extraInfo){
            this.solicitando = false;
            switch (ruta){
              case 'unidad':
                this.unidades.splice(this.unidad.indexOf(obj),1);
                break;
            }
          } else {
            this.toastr.info(data.operacionMensaje,"Informacion");
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  private handleError(error: any): void {
    this.toastr.error("Error interno.","Error");
    this.solicitando = false;
    this.solicitudExitosa = false;
  }

}
