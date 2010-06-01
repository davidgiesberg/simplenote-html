load 'deploy'

set :application, "simpleview"
set :domain,      "fivepoint.jerakeen.org"
set :repository,  "git://github.com/tominsam/simpleview.git"
set :use_sudo,    false
set :deploy_to,   "/home/tomi/CapDeploy/#{application}"
set :scm,         "git"

role :app, domain
role :web, domain
role :db,  domain, :primary => true

namespace :deploy do
  task :start, :roles => :app do
    run "sass --update #{deploy_to}"
    run "ln -fs #{deploy_to} /home/tomi/web/movieos_generated/code"
  end

  task :stop, :roles => :app do
    # Do nothing.
  end

  desc "Restart Application"
  task :restart, :roles => :app do
    run "sass --update #{deploy_to}"
    run "ln -fs #{deploy_to} /home/tomi/web/movieos_generated/code"
  end
end