#
# Cookbook Name:: dashery
# Recipe:: default
#
# The MIT License (MIT)
#
# Copyright (c) 2015 John Manero
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#
include_recipe 'apt'
include_recipe 'datadog::dd-agent'
include_recipe 'datadog::dd-handler'
include_recipe 'datadog::nginx'
include_recipe 'libarchive'

package 'nginx'
package 'nodejs'
package 'npm'
package 'uuid'

## Fetch app and extract archive
asset = github_asset "dashery-#{ node['dashery']['version'] }.tar.gz" do
  repo 'jmanero/dashery'
  release node['dashery']['version']
  not_if { node['vagrant'] }

  notifies :extract, 'libarchive_file[dashery-source.tar.gz]', :immediate
end

libarchive_file 'dashery-source.tar.gz' do
  path asset.asset_path
  extract_to node['dashery']['source']

  action :nothing
  notifies :restart, 'service[dashery]'
  only_if { ::File.exist?(asset.asset_path) }
end

## Install NodeJS modules
execute 'npm-install' do
  cwd node['dashery']['source']
  command '/usr/bin/npm install'

  notifies :start, 'service[dashery]'
end

## Configure reverse proxy
template '/etc/nginx/sites-available/dashery' do
  source 'nginx.conf.erb'
  notifies :reload, 'service[nginx]'
end

link '/etc/nginx/sites-enabled/dashery' do
  to '/etc/nginx/sites-available/dashery'
  notifies :reload, 'service[nginx]'
end
link '/etc/nginx/sites-enabled/default' do
  action :delete
  notifies :reload, 'service[nginx]'
end

## Configure and start services
template '/etc/init/dashery.conf' do
  source 'upstart.conf.erb'
end

service 'dashery' do
  action [:enable, :start]
  provider Chef::Provider::Service::Upstart
  ignore_failure true
end

service 'nginx' do
  supports :status => true, :reload => true
  action [:enable, :start]
end
