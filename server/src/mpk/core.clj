(ns mpk.core
  (:gen-class)
  (:use ring.middleware.params
        ring.util.response
        ring.adapter.jetty
        ring.middleware.session
        mpk.configuration)
  (:require [mpk.action-handlers :as handlers :refer :all]
            [clj-time.core :as t]
            [clj-time.format :as f]))

(def mpk-formatter (f/formatter "yyyy-MM-dd HH:mm:ss"))

(def valid-actions {"put" :put "get" :get "key" :key})

(def actions {:get (handlers/->ReadHandler)
              :put (handlers/->SaveHandler)
              :key (handlers/->KeyHandler)})

(defn valid-action? [request]
  (let [{action "action" :as params} (:params request)]
    (not (or (nil? action) (nil? (get valid-actions action))))))

(defn decorate-response-in-jsonp-callback [params response]
  (handlers/->Response
   (:status response)
   (str (get params "callback") "(" (:body response) ")")
   (:session response)))

(defn mpk-response-to-response [resp]
  (-> (response (:body resp)) (status (:status resp)) (content-type "application/json") (assoc :session (:session resp))))

(defn check-callback-paramater [params session handler]
  (if (nil? (get params "callback"))
     (-> (response "This service responds only to JSONP request. You are missing callback parameter") (status 405))
     (perform handler params session)))

(defn handle-service-request [request]
  (let [{action "action" :as params} (:params request) session (:session request)]
    (if (or (nil? action) (nil? (get valid-actions action)))
      (-> (response "Invalid method") (status 405))
      (let [the-action-handler ((get valid-actions action) actions)]
        (mpk-response-to-response
         (decorate-response-in-jsonp-callback params (check-callback-paramater params session the-action-handler)))))))

(defn mpk-handler [request]
  (let [uri (:uri request)]
    (if (not (.contains (.toLowerCase uri) "/service/kanban"))
      (do
        (println (str "[" (f/unparse mpk-formatter (t/now)) "] " request))
        (-> (response "Invalid method") (status 405)))
      (handle-service-request request))))

(def mpk-app (wrap-session (wrap-params mpk-handler)))

(defn -main [& args]
  (do-build-configuration args)
  (run-jetty mpk-app @configuration))
