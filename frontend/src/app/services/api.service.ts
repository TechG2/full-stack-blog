import { Injectable } from '@angular/core';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiURL } from '../../config/config.json';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor() {}

  async get(
    url: string,
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<any, any>> {
    return await axios.get(`${apiURL}/${url}`, options);
  }

  async post(
    url: string,
    data?: AxiosRequestConfig<any> | {},
    options?: AxiosRequestConfig<any> | undefined
  ): Promise<AxiosResponse<any, any>> {
    return await axios.post(`${apiURL}/${url}`, data, options);
  }

  async patch(
    url: string,
    data?: AxiosRequestConfig<any> | {},
    options?: AxiosRequestConfig<any> | undefined
  ): Promise<AxiosResponse<any, any>> {
    return await axios.patch(`${apiURL}/${url}`, data, options);
  }

  async delete(
    url: string,
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<any, any>> {
    return await axios.delete(`${apiURL}/${url}`, options);
  }
}
