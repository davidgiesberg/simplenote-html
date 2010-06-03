load 'deploy'

set :application, "simplenote-html"
set :domain,      "fivepoint.jerakeen.org"
set :repository,  "git://github.com/tominsam/simplenote-html.git"
set :use_sudo,    false
set :deploy_to,   "/home/tomi/CapDeploy/#{application}"
set :scm,         "git"

role :app, domain
role :web, domain
role :db,  domain, :primary => true

namespace :deploy do
  task :start, :roles => :app do
    run "sass --update #{deploy_to}/current/"
    run "ln -fs #{deploy_to}/current /home/tomi/web/movieos_generated/code/simplenote-html"
  end

  task :stop, :roles => :app do
    # Do nothing.
  end

  desc "Restart Application"
  task :restart, :roles => :app do
    run "sass --update #{deploy_to}/current/"
    run "ln -fs #{deploy_to}/current /home/tomi/web/movieos_generated/code/simplenote-html"
  end
end
