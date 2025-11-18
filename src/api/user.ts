/**
 * =============================================================================
 * 用户相关 API
 * =============================================================================
 */

import { get, post } from './request'
import type { UserInfo, LoginParams, LoginResult, PaginatedResponse } from '@/types'

/**
 * 用户登录
 */
export function login(data: LoginParams) {
  return post<LoginResult>('/auth/login', data)
}

/**
 * 用户登出
 */
export function logout() {
  return post('/auth/logout')
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  return get<UserInfo>('/user/current')
}

/**
 * 获取用户列表
 */
export function getUserList(params: {
  page: number
  pageSize: number
  keyword?: string
}) {
  return get<PaginatedResponse<UserInfo>>('/user/list', params)
}

/**
 * 获取用户详情
 */
export function getUserDetail(id: number) {
  return get<UserInfo>(`/user/${id}`)
}

/**
 * 创建用户
 */
export function createUser(data: Partial<UserInfo>) {
  return post<UserInfo>('/user', data)
}

/**
 * 更新用户
 */
export function updateUser(id: number, data: Partial<UserInfo>) {
  return post<UserInfo>(`/user/${id}`, data)
}

/**
 * 删除用户
 */
export function deleteUser(id: number) {
  return post(`/user/${id}/delete`)
}
